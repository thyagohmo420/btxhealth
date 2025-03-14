-- Remover views existentes
DROP VIEW IF EXISTS patient_search;
DROP VIEW IF EXISTS appointments_view;
DROP VIEW IF EXISTS patient_medical_records;
DROP VIEW IF EXISTS patient_medical_history;

-- Remover triggers existentes
DROP TRIGGER IF EXISTS update_patient_status_trigger ON appointments;
DROP TRIGGER IF EXISTS validate_patient_cpf_trigger ON patients;

-- Recriar tabela patients do zero
DROP TABLE IF EXISTS patients CASCADE;
CREATE TABLE patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    gender TEXT NOT NULL,
    cpf TEXT UNIQUE,
    rg TEXT,
    sus_card TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    mother_name TEXT,
    father_name TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    blood_type TEXT,
    allergies TEXT[],
    chronic_conditions TEXT[],
    health_insurance TEXT,
    health_insurance_number TEXT,
    health_insurance_validity DATE,
    marital_status TEXT,
    nationality TEXT DEFAULT 'Brasileiro',
    occupation TEXT,
    education_level TEXT,
    race TEXT,
    ethnicity TEXT,
    priority TEXT DEFAULT 'normal',
    status TEXT DEFAULT 'waiting',
    preferred_contact TEXT DEFAULT 'phone',
    notes TEXT,
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    medications TEXT[],
    risk_factors TEXT[],
    last_visit_date TIMESTAMP WITH TIME ZONE,
    next_visit_date TIMESTAMP WITH TIME ZONE,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
DROP POLICY IF EXISTS "Permitir leitura de pacientes para usuários autenticados" ON patients;
DROP POLICY IF EXISTS "Permitir inserção de pacientes para recepcionistas e admin" ON patients;
DROP POLICY IF EXISTS "Permitir atualização de pacientes para recepcionistas e admin" ON patients;

CREATE POLICY "Permitir leitura de pacientes para usuários autenticados"
ON patients FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de pacientes para recepcionistas e admin"
ON patients FOR INSERT TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'receptionist']));

CREATE POLICY "Permitir atualização de pacientes para recepcionistas e admin"
ON patients FOR UPDATE TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'receptionist']));

-- Criar view para busca de pacientes
CREATE VIEW patient_search AS
SELECT 
    id,
    full_name,
    cpf,
    rg,
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
    priority,
    status,
    preferred_contact,
    notes,
    height,
    weight,
    medications,
    risk_factors,
    last_visit_date,
    next_visit_date,
    registration_date,
    active,
    created_at,
    updated_at
FROM patients
WHERE active = true
ORDER BY created_at DESC;

-- Criar view para atendimentos
CREATE VIEW appointments_view AS
SELECT 
    a.*,
    p.full_name as patient_name,
    p.cpf as patient_cpf,
    p.rg as patient_rg,
    p.sus_card as patient_sus,
    p.birth_date as patient_birth_date,
    p.gender as patient_gender,
    p.phone as patient_phone,
    p.health_insurance as patient_health_insurance,
    p.health_insurance_number as patient_health_insurance_number,
    p.priority as patient_priority,
    p.status as patient_status,
    prof.full_name as professional_name,
    prof.specialty as professional_specialty,
    s.name as sector_name
FROM appointments a
LEFT JOIN patients p ON a.patient_id = p.id
LEFT JOIN professionals prof ON a.professional_id = prof.id
LEFT JOIN sectors s ON prof.sector_id = s.id
ORDER BY a.date DESC, a.time DESC;

-- Criar view para prontuários
CREATE VIEW patient_medical_records AS
SELECT 
    mr.*,
    p.full_name as patient_name,
    p.cpf as patient_cpf,
    p.rg as patient_rg,
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

-- Criar índices para melhorar performance
CREATE INDEX idx_patients_full_name ON patients(full_name);
CREATE INDEX idx_patients_cpf ON patients(cpf);
CREATE INDEX idx_patients_rg ON patients(rg);
CREATE INDEX idx_patients_sus_card ON patients(sus_card);
CREATE INDEX idx_patients_priority ON patients(priority);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_active ON patients(active);

-- Criar trigger para atualizar timestamp
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 