-- Limpar registros órfãos da triagem
DELETE FROM triage_backup
WHERE patient_id NOT IN (SELECT id FROM patients);

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

-- Restaurar apenas dados válidos da triagem
INSERT INTO triage (
    id, patient_id, symptoms, medications, allergies, 
    vital_signs, priority, notes, status, created_at, updated_at
)
SELECT 
    id, patient_id, COALESCE(symptoms, '{}'), COALESCE(medications, '{}'), 
    COALESCE(allergies, '{}'), COALESCE(vital_signs, '{"temperature": "", "blood_pressure": "", "heart_rate": "", "respiratory_rate": ""}'),
    COALESCE(priority, 'normal'), notes, COALESCE(status, 'waiting'),
    created_at, updated_at
FROM triage_backup
WHERE patient_id IN (SELECT id FROM patients);

-- Adicionar foreign key após a inserção dos dados
ALTER TABLE triage
ADD CONSTRAINT triage_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES patients(id)
ON DELETE CASCADE;

-- Limpar registros órfãos da dispensação
DELETE FROM medication_dispensing_backup
WHERE patient_id NOT IN (SELECT id FROM patients)
OR medication_id NOT IN (SELECT id FROM pharmacy);

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

-- Restaurar apenas dados válidos da dispensação
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

-- Adicionar foreign keys após a inserção dos dados
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