-- Backup e recriação da tabela de vacinas
CREATE TABLE IF NOT EXISTS vaccines_backup AS SELECT * FROM vaccines;

DROP TABLE IF EXISTS vaccines CASCADE;
CREATE TABLE vaccines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    manufacturer TEXT NOT NULL DEFAULT '',
    batch TEXT NOT NULL DEFAULT '',
    expiration_date DATE NOT NULL DEFAULT CURRENT_DATE,
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'dose',
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT stock_positive CHECK (stock >= 0),
    CONSTRAINT min_stock_positive CHECK (min_stock >= 0)
);

-- Restaurar dados das vacinas
INSERT INTO vaccines 
SELECT * FROM vaccines_backup;

DROP TABLE IF EXISTS vaccines_backup;

-- Backup e recriação da tabela de triagem
CREATE TABLE IF NOT EXISTS triage_backup AS SELECT * FROM triage;

DROP TABLE IF EXISTS triage CASCADE;
CREATE TABLE triage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) NOT NULL,
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

-- Restaurar dados da triagem
INSERT INTO triage (
    id, patient_id, symptoms, medications, allergies, 
    vital_signs, priority, notes, status, created_at, updated_at
)
SELECT 
    id, patient_id, COALESCE(symptoms, '{}'), COALESCE(medications, '{}'), 
    COALESCE(allergies, '{}'), COALESCE(vital_signs, '{"temperature": "", "blood_pressure": "", "heart_rate": "", "respiratory_rate": ""}'),
    COALESCE(priority, 'normal'), notes, COALESCE(status, 'waiting'),
    created_at, updated_at
FROM triage_backup;

DROP TABLE IF EXISTS triage_backup;

-- Backup e recriação da tabela de farmácia
CREATE TABLE IF NOT EXISTS pharmacy_backup AS SELECT * FROM pharmacy;

DROP TABLE IF EXISTS pharmacy CASCADE;
CREATE TABLE pharmacy (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    manufacturer TEXT NOT NULL DEFAULT '',
    batch TEXT NOT NULL DEFAULT '',
    expiration_date DATE NOT NULL DEFAULT CURRENT_DATE,
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'unidade',
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT stock_positive CHECK (stock >= 0),
    CONSTRAINT min_stock_positive CHECK (min_stock >= 0),
    CONSTRAINT price_positive CHECK (price >= 0)
);

-- Restaurar dados da farmácia
INSERT INTO pharmacy 
SELECT * FROM pharmacy_backup;

DROP TABLE IF EXISTS pharmacy_backup;

-- Backup e recriação da tabela de dispensação
CREATE TABLE IF NOT EXISTS medication_dispensing_backup AS SELECT * FROM medication_dispensing;

DROP TABLE IF EXISTS medication_dispensing CASCADE;
CREATE TABLE medication_dispensing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    medication_id UUID REFERENCES pharmacy(id) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    dispensed_by UUID REFERENCES auth.users(id) NOT NULL,
    dispensed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'cancelled'))
);

-- Restaurar dados da dispensação
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
FROM medication_dispensing_backup;

DROP TABLE IF EXISTS medication_dispensing_backup;

-- Recriar view de prontuário
DROP VIEW IF EXISTS patient_medical_records;
CREATE VIEW patient_medical_records AS
SELECT 
    p.id,
    p.full_name,
    p.cpf,
    p.sus_card,
    p.birth_date,
    p.gender,
    p.blood_type,
    p.allergies,
    p.chronic_conditions,
    p.health_insurance,
    p.health_insurance_number,
    p.priority,
    p.status,
    COALESCE(
        (SELECT json_agg(
            json_build_object(
                'id', mr.id,
                'date', mr.created_at,
                'professional', prof.full_name,
                'specialty', prof.specialty,
                'complaint', mr.complaint,
                'diagnosis', mr.diagnosis,
                'prescription', mr.prescription,
                'observations', mr.observations
            ) ORDER BY mr.created_at DESC
        ) FROM medical_records mr
        LEFT JOIN professionals prof ON mr.professional_id = prof.id
        WHERE mr.patient_id = p.id),
        '[]'::json
    ) as medical_records,
    COALESCE(
        (SELECT json_agg(
            json_build_object(
                'id', t.id,
                'date', t.created_at,
                'priority', t.priority,
                'vital_signs', t.vital_signs,
                'symptoms', t.symptoms,
                'notes', t.notes
            ) ORDER BY t.created_at DESC
        ) FROM triage t
        WHERE t.patient_id = p.id),
        '[]'::json
    ) as triage_history
FROM patients p
WHERE p.active = true;

-- Recriar função de atualização de estoque
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