/*
  # Fix patients table structure

  1. Changes
    - Rename birth_date to birthDate
    - Rename sus_card to susCard
    - Add missing columns
    - Update column types

  2. Security
    - Maintain existing RLS policies
*/

-- Renomear colunas existentes
ALTER TABLE patients RENAME COLUMN birth_date TO birthDate;
ALTER TABLE patients RENAME COLUMN sus_card TO susCard;

-- Atualizar tipos de colunas
ALTER TABLE patients 
  ALTER COLUMN birthDate TYPE date,
  ALTER COLUMN cpf TYPE text,
  ALTER COLUMN susCard TYPE text,
  ALTER COLUMN phone TYPE text,
  ALTER COLUMN email TYPE text,
  ALTER COLUMN address TYPE jsonb USING address::jsonb,
  ALTER COLUMN emergency_contact TYPE jsonb USING emergency_contact::jsonb;

-- Adicionar novas colunas se não existirem
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'full_name') THEN
    ALTER TABLE patients ADD COLUMN full_name text NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'priority') THEN
    ALTER TABLE patients ADD COLUMN priority text DEFAULT 'normal';
  END IF;
END $$;

-- Atualizar índices
DROP INDEX IF EXISTS idx_patients_birth_date;
CREATE INDEX IF NOT EXISTS idx_patients_birthDate ON patients(birthDate);

-- Atualizar triggers
DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();