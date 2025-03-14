/*
  # Fix patients table structure

  1. Changes
    - Drop existing columns and recreate with correct names
    - Ensure all column names match the frontend expectations
    - Add proper constraints and defaults

  2. Security
    - Maintain existing RLS policies
*/

-- Criar tabela temporária para backup dos dados
CREATE TABLE patients_backup AS SELECT * FROM patients;

-- Dropar a tabela existente
DROP TABLE patients;

-- Recriar a tabela com a estrutura correta
CREATE TABLE patients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name text NOT NULL,
  cpf text UNIQUE,
  rg text,
  sus_card text,
  birth_date date,
  phone text,
  email text,
  address jsonb,
  emergency_contact jsonb,
  priority text DEFAULT 'normal',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Restaurar os dados
INSERT INTO patients (
  id,
  full_name,
  cpf,
  rg,
  sus_card,
  birth_date,
  phone,
  email,
  address,
  emergency_contact,
  priority,
  created_at,
  updated_at
)
SELECT
  id,
  full_name,
  cpf,
  rg,
  sus_card,
  birth_date,
  phone,
  email,
  address,
  emergency_contact,
  priority,
  created_at,
  updated_at
FROM patients_backup;

-- Dropar a tabela de backup
DROP TABLE patients_backup;

-- Recriar índices
CREATE INDEX idx_patients_full_name ON patients(full_name);
CREATE INDEX idx_patients_cpf ON patients(cpf);
CREATE INDEX idx_patients_sus_card ON patients(sus_card);
CREATE INDEX idx_patients_birth_date ON patients(birth_date);

-- Recriar trigger de atualização
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Recriar políticas de RLS
CREATE POLICY "Enable read access for all authenticated users"
  ON patients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON patients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);