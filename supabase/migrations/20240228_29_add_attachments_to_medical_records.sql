-- Adicionar coluna attachments em medical_records se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'medical_records' 
        AND column_name = 'attachments'
    ) THEN
        ALTER TABLE medical_records ADD COLUMN attachments JSONB DEFAULT '[]';
    END IF;
END $$;

-- Atualizar registros existentes para garantir que attachments não seja nulo
UPDATE medical_records 
SET attachments = '[]'::jsonb 
WHERE attachments IS NULL; 