-- Remover políticas existentes da triagem
DROP POLICY IF EXISTS "triage_select_policy" ON triage;
DROP POLICY IF EXISTS "triage_insert_policy" ON triage;
DROP POLICY IF EXISTS "triage_update_policy" ON triage;
DROP POLICY IF EXISTS "triage_delete_policy" ON triage;

-- Desabilitar RLS temporariamente para debug
ALTER TABLE triage DISABLE ROW LEVEL SECURITY;

-- Criar políticas mais permissivas para debug
CREATE POLICY "triage_select_policy"
ON triage FOR SELECT TO authenticated
USING (true);

CREATE POLICY "triage_insert_policy"
ON triage FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "triage_update_policy"
ON triage FOR UPDATE TO authenticated
USING (true);

CREATE POLICY "triage_delete_policy"
ON triage FOR DELETE TO authenticated
USING (true);

-- Habilitar RLS novamente
ALTER TABLE triage ENABLE ROW LEVEL SECURITY;

-- Garantir que o owner possa fazer tudo
ALTER TABLE triage FORCE ROW LEVEL SECURITY;
ALTER TABLE triage ENABLE ROW LEVEL SECURITY; 