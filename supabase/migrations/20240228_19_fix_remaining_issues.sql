-- Ajustar tabela de vacinas
ALTER TABLE vaccines
ALTER COLUMN expiration_date SET DEFAULT CURRENT_DATE,
ALTER COLUMN manufacturer SET DEFAULT '',
ALTER COLUMN batch SET DEFAULT '',
ALTER COLUMN stock SET DEFAULT 0,
ALTER COLUMN min_stock SET DEFAULT 0;

-- Ajustar tabela de triagem
ALTER TABLE triage
ALTER COLUMN vital_signs SET DEFAULT '{}',
ALTER COLUMN priority SET DEFAULT 'normal';

-- Recriar view de prontuário
DROP VIEW IF EXISTS patient_medical_records;
CREATE OR REPLACE VIEW patient_medical_records AS
SELECT 
    mr.*,
    p.full_name as patient_name,
    p.cpf as patient_cpf,
    p.sus_card as patient_sus,
    p.birth_date as patient_birth_date,
    p.gender as patient_gender,
    p.blood_type as patient_blood_type,
    p.allergies as patient_allergies,
    p.chronic_conditions as patient_chronic_conditions,
    prof.full_name as professional_name,
    prof.specialty as professional_specialty
FROM medical_records mr
LEFT JOIN patients p ON mr.patient_id = p.id
LEFT JOIN professionals prof ON mr.professional_id = prof.id
WHERE p.active = true
ORDER BY mr.created_at DESC;

-- Recriar view de pacientes para triagem
DROP VIEW IF EXISTS triage_patients;
CREATE OR REPLACE VIEW triage_patients AS
SELECT 
    p.*,
    t.id as triage_id,
    t.priority as triage_priority,
    t.status as triage_status,
    t.vital_signs as triage_vital_signs,
    t.created_at as triage_date
FROM patients p
LEFT JOIN triage t ON p.id = t.patient_id
WHERE p.active = true
ORDER BY 
    CASE 
        WHEN t.priority = 'emergency' THEN 1
        WHEN t.priority = 'urgent' THEN 2
        WHEN t.priority = 'high' THEN 3
        WHEN t.priority = 'normal' THEN 4
        WHEN t.priority = 'low' THEN 5
        ELSE 6
    END,
    t.created_at DESC NULLS LAST;

-- Recriar função de atualização de estoque
CREATE OR REPLACE FUNCTION update_pharmacy_stock()
RETURNS TRIGGER AS $$
DECLARE
    current_stock INTEGER;
BEGIN
    -- Obter estoque atual
    SELECT stock INTO current_stock
    FROM pharmacy
    WHERE id = NEW.medication_id;

    -- Se for inserção, diminui o estoque
    IF TG_OP = 'INSERT' THEN
        IF current_stock >= NEW.quantity THEN
            UPDATE pharmacy
            SET 
                stock = stock - NEW.quantity,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = NEW.medication_id;
            
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
                (
                    SELECT COALESCE(price, 0) * NEW.quantity 
                    FROM pharmacy 
                    WHERE id = NEW.medication_id
                ),
                CURRENT_DATE,
                'cash',
                'completed',
                NEW.id,
                'medication_dispensing',
                NEW.dispensed_by
            );
            
            RETURN NEW;
        ELSE
            RAISE EXCEPTION 'Estoque insuficiente';
        END IF;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recriar trigger de estoque
DROP TRIGGER IF EXISTS update_pharmacy_stock_trigger ON medication_dispensing;
CREATE TRIGGER update_pharmacy_stock_trigger
    BEFORE INSERT ON medication_dispensing
    FOR EACH ROW
    EXECUTE FUNCTION update_pharmacy_stock();

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_professional_id ON medical_records(professional_id);
CREATE INDEX IF NOT EXISTS idx_triage_patient_id ON triage(patient_id);
CREATE INDEX IF NOT EXISTS idx_medication_dispensing_medication_id ON medication_dispensing(medication_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_reference_id ON financial_transactions(reference_id);

-- Garantir que as tabelas têm as colunas necessárias
DO $$
BEGIN
    -- Adicionar coluna de status em medication_dispensing se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medication_dispensing' AND column_name = 'status'
    ) THEN
        ALTER TABLE medication_dispensing ADD COLUMN status TEXT DEFAULT 'completed';
    END IF;

    -- Adicionar coluna de preço em pharmacy se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pharmacy' AND column_name = 'price'
    ) THEN
        ALTER TABLE pharmacy ADD COLUMN price DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$; 