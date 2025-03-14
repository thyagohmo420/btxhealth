-- Criar backups das tabelas existentes
DO $$ 
BEGIN
    -- Backup da tabela de triagem
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'triage') THEN
        CREATE TABLE IF NOT EXISTS triage_backup AS SELECT * FROM triage;
    END IF;

    -- Backup da tabela de dispensação
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'medication_dispensing') THEN
        CREATE TABLE IF NOT EXISTS medication_dispensing_backup AS SELECT * FROM medication_dispensing;
    END IF;
END $$;

-- Recriar tabela de triagem
DROP TABLE IF EXISTS triage CASCADE;
CREATE TABLE triage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    symptoms TEXT[] DEFAULT '{}',
    medications TEXT[] DEFAULT '{}',
    allergies TEXT[] DEFAULT '{}',
    vital_signs JSONB NOT NULL DEFAULT '{"temperature": "", "blood_pressure": "", "heart_rate": "", "respiratory_rate": ""}',
    priority TEXT NOT NULL DEFAULT 'normal',
    notes TEXT,
    status TEXT DEFAULT 'waiting',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_priority CHECK (priority IN ('emergency', 'urgent', 'high', 'normal', 'low')),
    CONSTRAINT valid_status CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled'))
);

-- Restaurar dados válidos da triagem se existir backup
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'triage_backup') THEN
        INSERT INTO triage (
            id, patient_id, symptoms, medications, allergies, 
            vital_signs, priority, notes, status, created_at, updated_at
        )
        SELECT 
            id, patient_id, COALESCE(symptoms, '{}'), COALESCE(medications, '{}'), 
            COALESCE(allergies, '{}'), 
            COALESCE(vital_signs, '{"temperature": "", "blood_pressure": "", "heart_rate": "", "respiratory_rate": ""}'),
            COALESCE(priority, 'normal'), notes, COALESCE(status, 'waiting'),
            created_at, updated_at
        FROM triage_backup
        WHERE patient_id IN (SELECT id FROM patients);

        DROP TABLE triage_backup;
    END IF;
END $$;

-- Adicionar foreign key para triagem
ALTER TABLE triage
ADD CONSTRAINT triage_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES patients(id)
ON DELETE CASCADE;

-- Recriar tabela de dispensação
DROP TABLE IF EXISTS medication_dispensing CASCADE;
CREATE TABLE medication_dispensing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    medication_id UUID NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    dispensed_by UUID NOT NULL,
    dispensed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'cancelled'))
);

-- Restaurar dados válidos da dispensação se existir backup
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'medication_dispensing_backup') THEN
        INSERT INTO medication_dispensing (
            id, patient_id, medication_id, quantity, unit_price,
            dispensed_by, dispensed_at, notes, status, created_at, updated_at
        )
        SELECT 
            id, patient_id, medication_id, quantity, COALESCE(
                (SELECT price FROM pharmacy WHERE id = medication_id), 
                0
            ),
            dispensed_by, dispensed_at, notes, 
            COALESCE(status, 'completed'), created_at, updated_at
        FROM medication_dispensing_backup
        WHERE patient_id IN (SELECT id FROM patients)
        AND medication_id IN (SELECT id FROM pharmacy);

        DROP TABLE medication_dispensing_backup;
    END IF;
END $$;

-- Adicionar foreign keys para dispensação
ALTER TABLE medication_dispensing
ADD CONSTRAINT medication_dispensing_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES patients(id)
ON DELETE CASCADE;

ALTER TABLE medication_dispensing
ADD CONSTRAINT medication_dispensing_medication_id_fkey 
FOREIGN KEY (medication_id) 
REFERENCES pharmacy(id)
ON DELETE RESTRICT;

ALTER TABLE medication_dispensing
ADD CONSTRAINT medication_dispensing_dispensed_by_fkey 
FOREIGN KEY (dispensed_by) 
REFERENCES auth.users(id)
ON DELETE RESTRICT;

-- Recriar trigger de estoque
CREATE OR REPLACE FUNCTION update_pharmacy_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Se for inserção, diminui o estoque
    IF TG_OP = 'INSERT' THEN
        UPDATE pharmacy
        SET 
            stock = stock - NEW.quantity,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.medication_id
        AND stock >= NEW.quantity
        RETURNING id INTO NEW.medication_id;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Estoque insuficiente';
        END IF;

        -- Registrar transação financeira
        INSERT INTO financial_transactions (
            type,
            category,
            description,
            amount,
            date,
            payment_method,
            status,
            reference_id,
            reference_type,
            created_by
        ) VALUES (
            'expense',
            'pharmacy',
            'Dispensação de medicamento: ' || (
                SELECT name FROM pharmacy WHERE id = NEW.medication_id
            ),
            NEW.total_price,
            CURRENT_DATE,
            'cash',
            'completed',
            NEW.id,
            'medication_dispensing',
            NEW.dispensed_by
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger de estoque
DROP TRIGGER IF EXISTS update_pharmacy_stock_trigger ON medication_dispensing;
CREATE TRIGGER update_pharmacy_stock_trigger
    BEFORE INSERT ON medication_dispensing
    FOR EACH ROW
    EXECUTE FUNCTION update_pharmacy_stock();

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_triage_patient_id ON triage(patient_id);
CREATE INDEX IF NOT EXISTS idx_triage_priority ON triage(priority);
CREATE INDEX IF NOT EXISTS idx_triage_status ON triage(status);
CREATE INDEX IF NOT EXISTS idx_medication_dispensing_patient_id ON medication_dispensing(patient_id);
CREATE INDEX IF NOT EXISTS idx_medication_dispensing_medication_id ON medication_dispensing(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_dispensing_status ON medication_dispensing(status); 