-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Permitir leitura de user_roles" ON user_roles;
DROP POLICY IF EXISTS "Permitir inserção de user_roles" ON user_roles;
DROP POLICY IF EXISTS "Permitir atualização de user_roles" ON user_roles;
DROP POLICY IF EXISTS "Permitir deleção de user_roles" ON user_roles;
DROP POLICY IF EXISTS "Permitir gerenciamento de user_roles para admin" ON user_roles;
DROP POLICY IF EXISTS "enable_select_for_authenticated" ON user_roles;
DROP POLICY IF EXISTS "enable_all_for_admin" ON user_roles;

DROP POLICY IF EXISTS "Permitir leitura de triagens" ON triage;
DROP POLICY IF EXISTS "Permitir inserção de triagens" ON triage;
DROP POLICY IF EXISTS "Permitir atualização de triagens" ON triage;
DROP POLICY IF EXISTS "Permitir deleção de triagens" ON triage;
DROP POLICY IF EXISTS "enable_select_for_authenticated" ON triage;
DROP POLICY IF EXISTS "enable_insert_for_nurse_admin" ON triage;
DROP POLICY IF EXISTS "enable_update_for_nurse_admin" ON triage;
DROP POLICY IF EXISTS "enable_delete_for_admin" ON triage;

-- Habilitar RLS nas tabelas
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage ENABLE ROW LEVEL SECURITY;

-- Criar função auxiliar para verificar role do usuário
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

-- Criar novas políticas para user_roles
CREATE POLICY "user_roles_select_policy"
ON user_roles FOR SELECT TO authenticated
USING (true);

CREATE POLICY "user_roles_admin_policy"
ON user_roles FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM roles r
        WHERE r.id IN (
            SELECT role_id 
            FROM user_roles 
            WHERE user_id = auth.uid()
        )
        AND r.name = 'admin'
    )
);

-- Criar novas políticas para triage
CREATE POLICY "triage_select_policy"
ON triage FOR SELECT TO authenticated
USING (true);

CREATE POLICY "triage_insert_policy"
ON triage FOR INSERT TO authenticated
WITH CHECK (has_role('admin') OR has_role('nurse'));

CREATE POLICY "triage_update_policy"
ON triage FOR UPDATE TO authenticated
USING (has_role('admin') OR has_role('nurse'));

CREATE POLICY "triage_delete_policy"
ON triage FOR DELETE TO authenticated
USING (has_role('admin')); 