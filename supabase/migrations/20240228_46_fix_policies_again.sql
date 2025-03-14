-- Remover TODAS as políticas existentes da tabela user_roles
DO $$ 
BEGIN
    -- Remover todas as políticas da tabela user_roles
    FOR pol IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_roles'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON user_roles', pol.policyname);
    END LOOP;
END $$;

-- Remover TODAS as políticas existentes da tabela triage
DO $$ 
BEGIN
    -- Remover todas as políticas da tabela triage
    FOR pol IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'triage'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON triage', pol.policyname);
    END LOOP;
END $$;

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
CREATE POLICY "enable_select_for_authenticated"
ON user_roles FOR SELECT TO authenticated
USING (true);

CREATE POLICY "enable_all_for_admin"
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
CREATE POLICY "enable_select_for_authenticated"
ON triage FOR SELECT TO authenticated
USING (true);

CREATE POLICY "enable_insert_for_nurse_admin"
ON triage FOR INSERT TO authenticated
WITH CHECK (has_role('admin') OR has_role('nurse'));

CREATE POLICY "enable_update_for_nurse_admin"
ON triage FOR UPDATE TO authenticated
USING (has_role('admin') OR has_role('nurse'));

CREATE POLICY "enable_delete_for_admin"
ON triage FOR DELETE TO authenticated
USING (has_role('admin')); 