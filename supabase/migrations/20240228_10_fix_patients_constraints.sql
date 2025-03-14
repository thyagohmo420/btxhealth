-- Backup dos dados existentes
CREATE TEMP TABLE IF NOT EXISTS patients_backup AS
SELECT * FROM patients;

-- Remover views existentes
DROP VIEW IF EXISTS patient_search;
DROP VIEW IF EXISTS appointments_view;
DROP VIEW IF EXISTS patient_medical_records;
DROP VIEW IF EXISTS patient_medical_history;

-- Remover triggers existentes
DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
DROP TRIGGER IF EXISTS validate_patient_cpf_trigger ON patients;

-- Recriar tabela patients com campos obrigatórios
DROP TABLE IF EXISTS patients CASCADE;
CREATE TABLE patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) > 0),
    birth_date DATE NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Masculino', 'Feminino', 'Outro')),
    cpf TEXT UNIQUE CHECK (cpf ~ '^\d{11}$' OR cpf IS NULL),
    rg TEXT,
    sus_card TEXT CHECK (sus_card ~ '^\d{15}$' OR sus_card IS NULL),
    phone TEXT NOT NULL CHECK (phone ~ '^\d{10,11}$'),
    email TEXT CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR email IS NULL),
    address TEXT,
    city TEXT,
    state TEXT CHECK (state IS NULL OR char_length(state) = 2),
    zip_code TEXT CHECK (zip_code ~ '^\d{8}$' OR zip_code IS NULL),
    mother_name TEXT,
    father_name TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT CHECK (emergency_phone ~ '^\d{10,11}$' OR emergency_phone IS NULL),
    blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') OR blood_type IS NULL),
    allergies TEXT[],
    chronic_conditions TEXT[],
    health_insurance TEXT,
    health_insurance_number TEXT,
    health_insurance_validity DATE,
    marital_status TEXT CHECK (marital_status IN ('Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'Outro') OR marital_status IS NULL),
    nationality TEXT DEFAULT 'Brasileiro',
    occupation TEXT,
    education_level TEXT,
    race TEXT CHECK (race IN ('Branco', 'Preto', 'Pardo', 'Amarelo', 'Indígena', 'Outro') OR race IS NULL),
    ethnicity TEXT,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('emergency', 'urgent', 'high', 'normal', 'low')),
    status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled')),
    preferred_contact TEXT DEFAULT 'phone' CHECK (preferred_contact IN ('phone', 'email', 'whatsapp')),
    notes TEXT,
    height DECIMAL(5,2) CHECK (height > 0 OR height IS NULL),
    weight DECIMAL(5,2) CHECK (weight > 0 OR weight IS NULL),
    medications TEXT[],
    risk_factors TEXT[],
    last_visit_date TIMESTAMP WITH TIME ZONE,
    next_visit_date TIMESTAMP WITH TIME ZONE,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Restaurar dados dos pacientes
INSERT INTO patients 
SELECT * FROM patients_backup;

-- Remover tabela temporária
DROP TABLE patients_backup;

-- Habilitar RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Permitir leitura de pacientes para usuários autenticados"
ON patients FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de pacientes para recepcionistas e admin"
ON patients FOR INSERT TO authenticated
WITH CHECK (
    auth.check_user_role(ARRAY['admin', 'receptionist']) AND
    char_length(trim(full_name)) > 0 AND
    birth_date IS NOT NULL AND
    gender IS NOT NULL AND
    phone IS NOT NULL
);

CREATE POLICY "Permitir atualização de pacientes para recepcionistas e admin"
ON patients FOR UPDATE TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'receptionist']));

-- Criar view para busca de pacientes
CREATE VIEW patient_search AS
SELECT 
    id,
    full_name,
    birth_date,
    gender,
    cpf,
    rg,
    sus_card,
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