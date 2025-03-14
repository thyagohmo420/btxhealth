-- Remover TODAS as políticas existentes da tabela medical_records
DROP POLICY IF EXISTS "medical_records_select_policy" ON medical_records;
DROP POLICY IF EXISTS "medical_records_insert_policy" ON medical_records;
DROP POLICY IF EXISTS "medical_records_update_policy" ON medical_records;
DROP POLICY IF EXISTS "Permitir leitura de prontuários" ON medical_records;
DROP POLICY IF EXISTS "Permitir criação de prontuários" ON medical_records;
DROP POLICY IF EXISTS "Permitir atualização de prontuários" ON medical_records;
DROP POLICY IF EXISTS "Medical records are viewable by authenticated users" ON medical_records;
DROP POLICY IF EXISTS "Medical records are insertable by staff" ON medical_records;
DROP POLICY IF EXISTS "Medical records are updatable by staff" ON medical_records;
DROP POLICY IF EXISTS "Medical records viewable by involved parties" ON medical_records;
DROP POLICY IF EXISTS "Medical records manageable by medical staff" ON medical_records;

-- Habilitar RLS na tabela medical_records
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

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