/*
  # Fix patients table structure

  1. Changes
    - Add missing columns
    - Update column types
    - Preserve existing data
    - Maintain foreign key relationships

  2. Security
    - Maintain RLS policies
*/

-- Adicionar colunas faltantes e ajustar tipos
DO $$ 
BEGIN
  -- Adicionar coluna birth_date se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'birth_date'
  ) THEN
    ALTER TABLE patients ADD COLUMN birth_date date;
  END IF;

  -- Adicionar coluna sus_card se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'sus_card'
  ) THEN
    ALTER TABLE patients ADD COLUMN sus_card text;
  END IF;

  -- Adicionar coluna priority se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'patients' AND column_name = 'priority'
  ) THEN
    ALTER TABLE patients ADD COLUMN priority text DEFAULT 'normal';
  END IF;

  -- Ajustar tipos das colunas existentes
  ALTER TABLE patients
    ALTER COLUMN full_name SET NOT NULL,
    ALTER COLUMN cpf TYPE text,
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
END $$;

-- Atualizar índices
DROP INDEX IF EXISTS idx_patients_birth_date;
CREATE INDEX IF NOT EXISTS idx_patients_birth_date ON patients(birth_date);
CREATE INDEX IF NOT EXISTS idx_patients_sus_card ON patients(sus_card);
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