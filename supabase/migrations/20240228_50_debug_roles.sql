-- Verificar e corrigir políticas de user_roles
DROP POLICY IF EXISTS "user_roles_select_policy" ON user_roles;
DROP POLICY IF EXISTS "user_roles_admin_policy" ON user_roles;

-- Habilitar RLS na tabela user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Criar política de leitura para user_roles
CREATE POLICY "user_roles_select_policy"
ON user_roles FOR SELECT TO authenticated
USING (true);

-- Criar política de gerenciamento para user_roles
CREATE POLICY "user_roles_admin_policy"
ON user_roles FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM roles r
        JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = auth.uid()
        AND r.name = 'admin'
    )
);

-- Verificar se a função has_role está correta
CREATE OR REPLACE FUNCTION has_role(role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM roles r
        JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = auth.uid()
        AND r.name = role_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar view para debug de roles
CREATE OR REPLACE VIEW user_roles_debug AS
SELECT 
    au.id as user_id,
    au.email,
    r.name as role_name
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id;

-- Garantir que as tabelas têm as permissões corretas
GRANT SELECT ON user_roles_debug TO authenticated;
GRANT SELECT ON roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_roles TO authenticated; 