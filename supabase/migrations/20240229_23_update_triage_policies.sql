-- Remover TODAS as políticas existentes da tabela triage
DROP POLICY IF EXISTS "Permitir inserção de triagem para equipe médica" ON triage;
DROP POLICY IF EXISTS "Permitir atualização de triagem para equipe médica" ON triage;
DROP POLICY IF EXISTS "triage_insert_policy" ON triage;
DROP POLICY IF EXISTS "triage_update_policy" ON triage;

-- Habilitar RLS na tabela triage (caso não esteja)
ALTER TABLE triage ENABLE ROW LEVEL SECURITY;

-- Criar novas políticas para triage
CREATE POLICY "triage_select_policy"
ON triage FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "triage_insert_policy"
ON triage FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('admin', 'doctor', 'nurse', 'receptionist')
    )
);

CREATE POLICY "triage_update_policy"
ON triage FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('admin', 'doctor', 'nurse', 'receptionist')
    )
); 