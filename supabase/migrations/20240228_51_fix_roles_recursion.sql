-- Remover todas as políticas existentes da tabela roles
DROP POLICY IF EXISTS "roles_select_policy" ON roles;
DROP POLICY IF EXISTS "roles_admin_policy" ON roles;

-- Habilitar RLS na tabela roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Criar política de leitura simples para roles (sem recursão)
CREATE POLICY "roles_select_policy"
ON roles FOR SELECT TO authenticated
USING (true);

-- Criar política de gerenciamento para roles (sem recursão)
CREATE POLICY "roles_admin_policy"
ON roles FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_id IN (
            SELECT id FROM roles WHERE name = 'admin'
        )
    )
);

-- Remover e recriar as políticas de user_roles sem usar a função has_role
DROP POLICY IF EXISTS "user_roles_select_policy" ON user_roles;
DROP POLICY IF EXISTS "user_roles_admin_policy" ON user_roles;

-- Política de leitura para user_roles
CREATE POLICY "user_roles_select_policy"
ON user_roles FOR SELECT TO authenticated
USING (true);

-- Política de gerenciamento para user_roles
CREATE POLICY "user_roles_admin_policy"
ON user_roles FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name = 'admin'
    )
);

-- Remover e recriar as políticas de triage sem usar a função has_role
DROP POLICY IF EXISTS "triage_select_policy" ON triage;
DROP POLICY IF EXISTS "triage_insert_policy" ON triage;
DROP POLICY IF EXISTS "triage_update_policy" ON triage;
DROP POLICY IF EXISTS "triage_delete_policy" ON triage;

-- Política de leitura para triage
CREATE POLICY "triage_select_policy"
ON triage FOR SELECT TO authenticated
USING (true);

-- Política de inserção para triage
CREATE POLICY "triage_insert_policy"
ON triage FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'nurse')
    )
);

-- Política de atualização para triage
CREATE POLICY "triage_update_policy"
ON triage FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'nurse')
    )
);

-- Política de deleção para triage
CREATE POLICY "triage_delete_policy"
ON triage FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name = 'admin'
    )
); 