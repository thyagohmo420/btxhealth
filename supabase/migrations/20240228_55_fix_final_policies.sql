-- Primeiro, desabilitar RLS em todas as tabelas
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE triage DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "roles_select_policy" ON roles;
DROP POLICY IF EXISTS "roles_all_policy" ON roles;
DROP POLICY IF EXISTS "user_roles_select_policy" ON user_roles;
DROP POLICY IF EXISTS "user_roles_all_policy" ON user_roles;
DROP POLICY IF EXISTS "triage_select_policy" ON triage;
DROP POLICY IF EXISTS "triage_insert_policy" ON triage;
DROP POLICY IF EXISTS "triage_update_policy" ON triage;
DROP POLICY IF EXISTS "triage_delete_policy" ON triage;

-- Remover views e funções que podem estar causando recursão
DROP MATERIALIZED VIEW IF EXISTS user_permissions;
DROP FUNCTION IF EXISTS check_user_role;
DROP FUNCTION IF EXISTS has_role;

-- Criar uma função simples para verificar roles (sem recursão)
CREATE OR REPLACE FUNCTION get_user_roles(user_id uuid)
RETURNS TABLE (role_name text) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT r.name
    FROM roles r
    JOIN user_roles ur ON r.id = ur.role_id
    WHERE ur.user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilitar RLS apenas na tabela de triagem
ALTER TABLE triage ENABLE ROW LEVEL SECURITY;

-- Criar políticas simples para triagem
CREATE POLICY "triage_select_policy" ON triage
FOR SELECT TO authenticated USING (true);

CREATE POLICY "triage_insert_policy" ON triage
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM get_user_roles(auth.uid()) 
        WHERE role_name IN ('admin', 'nurse')
    )
);

CREATE POLICY "triage_update_policy" ON triage
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM get_user_roles(auth.uid())
        WHERE role_name IN ('admin', 'nurse')
    )
);

CREATE POLICY "triage_delete_policy" ON triage
FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM get_user_roles(auth.uid())
        WHERE role_name = 'admin'
    )
);

-- Garantir que as permissões básicas estão corretas
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON roles TO authenticated;
GRANT SELECT ON user_roles TO authenticated;
GRANT ALL ON triage TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_roles TO authenticated;

-- Verificar as roles do usuário atual
SELECT * FROM get_user_roles('ddcf611b-b6a8-405d-a0c4-9961113101ae'); 