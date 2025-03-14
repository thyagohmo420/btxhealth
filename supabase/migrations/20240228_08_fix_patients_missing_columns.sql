-- Adicionar colunas faltantes à tabela patients
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'waiting',
ADD COLUMN IF NOT EXISTS last_visit_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_visit_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS registration_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS height DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS medications TEXT[],
ADD COLUMN IF NOT EXISTS risk_factors TEXT[];

-- Atualizar a view patient_search
DROP VIEW IF EXISTS patient_search;
CREATE VIEW patient_search AS
SELECT 
    id,
    full_name,
    format_cpf(cpf) as cpf,
    sus_card,
    birth_date,
    gender,
    phone,
    email,
    address,
    city,
    state,
    zip_code,
    mother_name,
    father_name,
    emergency_contact,
    emergency_phone,
    blood_type,
    allergies,
    chronic_conditions,
    health_insurance,
    health_insurance_number,
    health_insurance_validity,
    marital_status,
    nationality,
    occupation,
    education_level,
    race,
    ethnicity,
    preferred_contact,
    priority,
    status,
    last_visit_date,
    next_visit_date,
    registration_date,
    height,
    weight,
    medications,
    risk_factors,
    notes,
    active,
    created_at,
    updated_at
FROM patients
WHERE active = true
ORDER BY 
    CASE 
        WHEN priority = 'emergency' THEN 1
        WHEN priority = 'urgent' THEN 2
        WHEN priority = 'high' THEN 3
        WHEN priority = 'normal' THEN 4
        WHEN priority = 'low' THEN 5
        ELSE 6
    END,
    created_at DESC;

-- Atualizar a view appointments_view
DROP VIEW IF EXISTS appointments_view;
CREATE VIEW appointments_view AS
SELECT 
    a.*,
    p.full_name as patient_name,
    format_cpf(p.cpf) as patient_cpf,
    p.sus_card as patient_sus,
    p.birth_date as patient_birth_date,
    p.gender as patient_gender,
    p.phone as patient_phone,
    p.health_insurance as patient_health_insurance,
    p.health_insurance_number as patient_health_insurance_number,
    p.priority as patient_priority,
    p.status as patient_status,
    p.allergies as patient_allergies,
    p.chronic_conditions as patient_chronic_conditions,
    p.medications as patient_medications,
    p.risk_factors as patient_risk_factors,
    prof.full_name as professional_name,
    prof.specialty as professional_specialty,
    s.name as sector_name
FROM appointments a
LEFT JOIN patients p ON a.patient_id = p.id
LEFT JOIN professionals prof ON a.professional_id = prof.id
LEFT JOIN sectors s ON prof.sector_id = s.id
ORDER BY 
    CASE 
        WHEN p.priority = 'emergency' THEN 1
        WHEN p.priority = 'urgent' THEN 2
        WHEN p.priority = 'high' THEN 3
        WHEN p.priority = 'normal' THEN 4
        WHEN p.priority = 'low' THEN 5
        ELSE 6
    END,
    a.date DESC, 
    a.time DESC;

-- Criar função para atualizar status do paciente
CREATE OR REPLACE FUNCTION update_patient_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar status do paciente com base no último atendimento
    UPDATE patients
    SET 
        status = NEW.status,
        last_visit_date = CASE 
            WHEN NEW.status = 'completed' THEN timezone('utc'::text, now())
            ELSE last_visit_date
        END
    WHERE id = NEW.patient_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar status do paciente
DROP TRIGGER IF EXISTS update_patient_status_trigger ON appointments;
CREATE TRIGGER update_patient_status_trigger
    AFTER UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_status();

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_patients_priority ON patients(priority);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_last_visit_date ON patients(last_visit_date);
CREATE INDEX IF NOT EXISTS idx_patients_registration_date ON patients(registration_date); 