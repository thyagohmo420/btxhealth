/*
  # Fix patients table structure

  1. Changes
    - Rename and modify columns to match frontend expectations
    - Add missing columns
    - Update column types
    - Preserve existing data and relationships

  2. Security
    - Maintain existing RLS policies
*/

-- Renomear colunas mantendo os dados
ALTER TABLE patients 
  RENAME COLUMN birth_date TO birth_date_old;

ALTER TABLE patients 
  ADD COLUMN birth_date date;

-- Copiar dados com conversão de tipo
UPDATE patients 
SET birth_date = birth_date_old::date 
WHERE birth_date_old IS NOT NULL;

-- Remover coluna antiga
ALTER TABLE patients 
  DROP COLUMN birth_date_old;

-- Ajustar tipos e constraints das colunas
ALTER TABLE patients
  ALTER COLUMN full_name SET NOT NULL,
  ALTER COLUMN cpf TYPE text,
  ALTER COLUMN sus_card TYPE text,
  ALTER COLUMN phone TYPE text,
  ALTER COLUMN email TYPE text,
  ALTER COLUMN address TYPE jsonb USING CASE 
    WHEN address IS NULL THEN '{}'::jsonb
    ELSE address::jsonb
  END,
  ALTER COLUMN emergency_contact TYPE jsonb USING CASE 
    WHEN emergency_contact IS NULL THEN '{}'::jsonb
    ELSE emergency_contact::jsonb
  END;

-- Adicionar coluna priority se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'priority'
  ) THEN
    ALTER TABLE patients ADD COLUMN priority text DEFAULT 'normal';
  END IF;
END $$;

-- Atualizar índices
DROP INDEX IF EXISTS idx_patients_birth_date;
CREATE INDEX IF NOT EXISTS idx_patients_birth_date ON patients(birth_date);
CREATE INDEX IF NOT EXISTS idx_patients_priority ON patients(priority);

-- Garantir que o trigger de updated_at existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_patients_updated_at'
  ) THEN
    CREATE TRIGGER update_patients_updated_at
      BEFORE UPDATE ON patients
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;