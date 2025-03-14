/*
  # Correção da estrutura do banco de dados

  1. Ajustes
    - Padronizar nomes de colunas
    - Adicionar validações
    - Melhorar foreign keys
    - Adicionar índices

  2. Segurança
    - Atualizar políticas RLS
    - Adicionar validações de entrada
*/

-- Ajustar estrutura da tabela patients
ALTER TABLE patients
  ALTER COLUMN full_name SET NOT NULL,
  ALTER COLUMN birth_date TYPE date,
  ALTER COLUMN cpf TYPE text,
  ALTER COLUMN sus_card TYPE text,
  ALTER COLUMN phone TYPE text,
  ALTER COLUMN email TYPE text,
  ALTER COLUMN address TYPE jsonb USING COALESCE(address::jsonb, '{}'),
  ALTER COLUMN emergency_contact TYPE jsonb USING COALESCE(emergency_contact::jsonb, '{}'),
  ALTER COLUMN priority SET DEFAULT 'normal';

-- Adicionar validações
ALTER TABLE patients
  ADD CONSTRAINT check_cpf_format 
  CHECK (cpf ~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$' OR cpf IS NULL);

ALTER TABLE patients
  ADD CONSTRAINT check_sus_card_format
  CHECK (sus_card ~ '^\d{15}$' OR sus_card IS NULL);

ALTER TABLE patients
  ADD CONSTRAINT check_priority_values
  CHECK (priority IN ('normal', 'urgent'));

-- Melhorar índices
CREATE INDEX IF NOT EXISTS idx_patients_full_name ON patients(full_name);
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON patients(cpf);
CREATE INDEX IF NOT EXISTS idx_patients_sus_card ON patients(sus_card);
CREATE INDEX IF NOT EXISTS idx_patients_birth_date ON patients(birth_date);
CREATE INDEX IF NOT EXISTS idx_patients_priority ON patients(priority);

-- Atualizar políticas RLS
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON patients;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON patients;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON patients;

CREATE POLICY "Patients are viewable by authenticated users"
  ON patients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Patients are insertable by staff"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'reception', 'doctor', 'nurse'));

CREATE POLICY "Patients are updatable by staff"
  ON patients FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'reception', 'doctor', 'nurse'));