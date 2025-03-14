-- Remover políticas existentes da triagem
DROP POLICY IF EXISTS "triage_select_policy" ON triage;
DROP POLICY IF EXISTS "triage_insert_policy" ON triage;
DROP POLICY IF EXISTS "triage_update_policy" ON triage;
DROP POLICY IF EXISTS "triage_delete_policy" ON triage;

-- Habilitar RLS
ALTER TABLE triage ENABLE ROW LEVEL SECURITY;

-- Criar função auxiliar para verificar role do usuário (se não existir)
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

-- Criar políticas para triagem
CREATE POLICY "triage_select_policy"
ON triage FOR SELECT TO authenticated
USING (true);

CREATE POLICY "triage_insert_policy"
ON triage FOR INSERT TO authenticated
WITH CHECK (
    has_role('admin') OR has_role('nurse')
);

CREATE POLICY "triage_update_policy"
ON triage FOR UPDATE TO authenticated
USING (
    has_role('admin') OR has_role('nurse')
);

CREATE POLICY "triage_delete_policy"
ON triage FOR DELETE TO authenticated
USING (has_role('admin')); 