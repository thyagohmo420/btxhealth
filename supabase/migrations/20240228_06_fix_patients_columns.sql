-- Remover views existentes primeiro
DROP VIEW IF EXISTS patient_search;
DROP VIEW IF EXISTS appointments_view;
DROP VIEW IF EXISTS patient_medical_records;
DROP VIEW IF EXISTS patient_medical_history;

-- Remover índices existentes
DROP INDEX IF EXISTS idx_patients_health_insurance_trgm;

-- Adicionar novas colunas à tabela patients
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS health_insurance TEXT,
ADD COLUMN IF NOT EXISTS health_insurance_number TEXT,
ADD COLUMN IF NOT EXISTS health_insurance_validity DATE,
ADD COLUMN IF NOT EXISTS marital_status TEXT,
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS education_level TEXT,
ADD COLUMN IF NOT EXISTS race TEXT,
ADD COLUMN IF NOT EXISTS ethnicity TEXT,
ADD COLUMN IF NOT EXISTS preferred_contact TEXT DEFAULT 'phone',
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Garantir que a função format_cpf existe
CREATE OR REPLACE FUNCTION format_cpf(cpf TEXT)
RETURNS TEXT AS $$
BEGIN
    IF cpf IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN regexp_replace(cpf, '(\d{3})(\d{3})(\d{3})(\d{2})', '\1.\2.\3-\4');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Criar view para busca de pacientes com CPF formatado
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
    notes,
    active,
    created_at,
    updated_at
FROM patients
WHERE active = true
ORDER BY full_name;

-- Criar view para atendimentos com informações completas
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
    prof.full_name as professional_name,
    prof.specialty as professional_specialty,
    s.name as sector_name
FROM appointments a
LEFT JOIN patients p ON a.patient_id = p.id
LEFT JOIN professionals prof ON a.professional_id = prof.id
LEFT JOIN sectors s ON prof.sector_id = s.id
ORDER BY a.date DESC, a.time DESC;

-- Criar view para prontuários com informações completas
CREATE VIEW patient_medical_records AS
SELECT 
    mr.*,
    p.full_name as patient_name,
    format_cpf(p.cpf) as patient_cpf,
    p.sus_card as patient_sus,
    p.birth_date as patient_birth_date,
    p.gender as patient_gender,
    p.blood_type as patient_blood_type,
    p.allergies as patient_allergies,
    p.chronic_conditions as patient_chronic_conditions,
    p.health_insurance as patient_health_insurance,
    p.health_insurance_number as patient_health_insurance_number,
    prof.full_name as professional_name,
    prof.specialty as professional_specialty
FROM medical_records mr
LEFT JOIN patients p ON mr.patient_id = p.id
LEFT JOIN professionals prof ON mr.professional_id = prof.id
ORDER BY mr.created_at DESC;

-- Criar view para histórico médico com informações completas
CREATE VIEW patient_medical_history AS
SELECT 
    mh.*,
    p.full_name as patient_name,
    format_cpf(p.cpf) as patient_cpf,
    p.sus_card as patient_sus,
    p.birth_date as patient_birth_date,
    p.gender as patient_gender,
    p.blood_type as patient_blood_type,
    p.allergies as patient_allergies,
    p.chronic_conditions as patient_chronic_conditions
FROM medical_history mh
LEFT JOIN patients p ON mh.patient_id = p.id
ORDER BY mh.date DESC;

-- Habilitar extensão para busca por similaridade
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Criar índice para busca por plano de saúde
CREATE INDEX idx_patients_health_insurance_trgm ON patients USING gin (health_insurance gin_trgm_ops); 