-- Primeiro, vamos desabilitar RLS temporariamente em todas as tabelas
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE triage DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "roles_select_policy" ON roles;
DROP POLICY IF EXISTS "roles_admin_policy" ON roles;
DROP POLICY IF EXISTS "user_roles_select_policy" ON user_roles;
DROP POLICY IF EXISTS "user_roles_admin_policy" ON user_roles;
DROP POLICY IF EXISTS "triage_select_policy" ON triage;
DROP POLICY IF EXISTS "triage_insert_policy" ON triage;
DROP POLICY IF EXISTS "triage_update_policy" ON triage;
DROP POLICY IF EXISTS "triage_delete_policy" ON triage;

-- Criar uma view materializada para cache de permissões
DROP MATERIALIZED VIEW IF EXISTS user_permissions;
CREATE MATERIALIZED VIEW user_permissions AS
SELECT 
    ur.user_id,
    array_agg(DISTINCT r.name) as roles
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
GROUP BY ur.user_id;

-- Criar índice para performance
CREATE UNIQUE INDEX idx_user_permissions_user_id ON user_permissions (user_id);

-- Função para atualizar a view materializada
CREATE OR REPLACE FUNCTION refresh_user_permissions()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_permissions;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers para manter a view materializada atualizada
DROP TRIGGER IF EXISTS refresh_permissions_user_roles ON user_roles;
CREATE TRIGGER refresh_permissions_user_roles
AFTER INSERT OR UPDATE OR DELETE ON user_roles
FOR EACH STATEMENT EXECUTE FUNCTION refresh_user_permissions();

DROP TRIGGER IF EXISTS refresh_permissions_roles ON roles;
CREATE TRIGGER refresh_permissions_roles
AFTER INSERT OR UPDATE OR DELETE ON roles
FOR EACH STATEMENT EXECUTE FUNCTION refresh_user_permissions();

-- Função simplificada para verificar role (usando a view materializada)
CREATE OR REPLACE FUNCTION check_user_role(required_roles text[])
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_permissions up
        WHERE up.user_id = auth.uid()
        AND up.roles && required_roles
    );
END;
$$;

-- Habilitar RLS nas tabelas
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage ENABLE ROW LEVEL SECURITY;

-- Políticas para roles (tabela base)
CREATE POLICY "roles_select_policy" ON roles
FOR SELECT TO authenticated USING (true);

CREATE POLICY "roles_all_policy" ON roles
FOR ALL TO authenticated
USING (check_user_role(ARRAY['admin']));

-- Políticas para user_roles
CREATE POLICY "user_roles_select_policy" ON user_roles
FOR SELECT TO authenticated USING (true);

CREATE POLICY "user_roles_all_policy" ON user_roles
FOR ALL TO authenticated
USING (check_user_role(ARRAY['admin']));

-- Políticas para triage
CREATE POLICY "triage_select_policy" ON triage
FOR SELECT TO authenticated USING (true);

CREATE POLICY "triage_insert_update_policy" ON triage
FOR INSERT TO authenticated
WITH CHECK (check_user_role(ARRAY['admin', 'nurse']));

CREATE POLICY "triage_update_policy" ON triage
FOR UPDATE TO authenticated
USING (check_user_role(ARRAY['admin', 'nurse']));

CREATE POLICY "triage_delete_policy" ON triage
FOR DELETE TO authenticated
USING (check_user_role(ARRAY['admin']));

-- Garantir permissões corretas
GRANT SELECT ON user_permissions TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_role TO authenticated;

-- Fazer o refresh inicial da view materializada
REFRESH MATERIALIZED VIEW CONCURRENTLY user_permissions; 