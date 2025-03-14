-- Habilitar RLS na tabela medical_records
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas existentes da tabela medical_records
DROP POLICY IF EXISTS "Permitir leitura de registros médicos para usuários autentica" ON medical_records;
DROP POLICY IF EXISTS "Permitir leitura de registros médicos para usuários autenticados" ON medical_records;
DROP POLICY IF EXISTS "Permitir inserção de registros médicos para equipe médica" ON medical_records;
DROP POLICY IF EXISTS "Permitir atualização de registros médicos para equipe médica" ON medical_records;

-- Criar novas políticas para medical_records
CREATE POLICY "medical_records_select_policy"
ON medical_records FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "medical_records_insert_policy"
ON medical_records FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 
        FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('admin', 'doctor', 'nurse', 'receptionist')
    )
);

CREATE POLICY "medical_records_update_policy"
ON medical_records FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('admin', 'doctor', 'nurse', 'receptionist')
    )
); 