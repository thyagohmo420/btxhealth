-- Remover e recriar a tabela triage corretamente
DROP TABLE IF EXISTS triage CASCADE;
CREATE TABLE triage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    professional_id UUID REFERENCES professionals(id) NOT NULL,
    vital_signs JSONB DEFAULT '{}'::jsonb,
    symptoms TEXT[],
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'waiting',
    priority TEXT NOT NULL DEFAULT 'normal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_triage_status CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled')),
    CONSTRAINT valid_triage_priority CHECK (priority IN ('emergency', 'urgent', 'high', 'normal', 'low'))
);

-- Remover e recriar a tabela medical_records corretamente
DROP TABLE IF EXISTS medical_records CASCADE;
CREATE TABLE medical_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    professional_id UUID REFERENCES professionals(id) NOT NULL,
    complaint TEXT,
    diagnosis TEXT,
    prescription TEXT,
    observations TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_record_status CHECK (status IN ('active', 'inactive', 'archived'))
);

-- Remover e recriar a tabela exams corretamente
DROP TABLE IF EXISTS exams CASCADE;
CREATE TABLE exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    professional_id UUID REFERENCES professionals(id) NOT NULL,
    type TEXT NOT NULL,
    request_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    result_date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'pending',
    result TEXT,
    files JSONB DEFAULT '[]'::jsonb,
    requested_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_exam_status CHECK (status IN ('pending', 'completed', 'cancelled'))
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_triage_patient_id ON triage(patient_id);
CREATE INDEX IF NOT EXISTS idx_triage_status ON triage(status);
CREATE INDEX IF NOT EXISTS idx_triage_priority ON triage(priority);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_status ON medical_records(status);
CREATE INDEX IF NOT EXISTS idx_exams_patient_id ON exams(patient_id);
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);

-- Habilitar RLS
ALTER TABLE triage ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- Criar políticas
-- Triage
DROP POLICY IF EXISTS "Permitir leitura de triagens" ON triage;
CREATE POLICY "Permitir leitura de triagens"
ON triage FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Permitir inserção de triagens" ON triage;
CREATE POLICY "Permitir inserção de triagens"
ON triage FOR INSERT TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'nurse']));

DROP POLICY IF EXISTS "Permitir atualização de triagens" ON triage;
CREATE POLICY "Permitir atualização de triagens"
ON triage FOR UPDATE TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'nurse']));

-- Medical Records
DROP POLICY IF EXISTS "Permitir leitura de prontuários" ON medical_records;
CREATE POLICY "Permitir leitura de prontuários"
ON medical_records FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Permitir inserção de prontuários" ON medical_records;
CREATE POLICY "Permitir inserção de prontuários"
ON medical_records FOR INSERT TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

DROP POLICY IF EXISTS "Permitir atualização de prontuários" ON medical_records;
CREATE POLICY "Permitir atualização de prontuários"
ON medical_records FOR UPDATE TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

-- Exams
DROP POLICY IF EXISTS "Permitir leitura de exames" ON exams;
CREATE POLICY "Permitir leitura de exames"
ON exams FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Permitir inserção de exames" ON exams;
CREATE POLICY "Permitir inserção de exames"
ON exams FOR INSERT TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

DROP POLICY IF EXISTS "Permitir atualização de exames" ON exams;
CREATE POLICY "Permitir atualização de exames"
ON exams FOR UPDATE TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

-- Criar função para atualizar status do paciente
CREATE OR REPLACE FUNCTION update_patient_status()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE patients
    SET 
        status = NEW.status,
        priority = NEW.priority,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.patient_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para atualizar status do paciente
DROP TRIGGER IF EXISTS update_patient_status_trigger ON triage;
CREATE TRIGGER update_patient_status_trigger
    AFTER INSERT OR UPDATE ON triage
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_status();

-- Criar views
DROP VIEW IF EXISTS electronic_records_view CASCADE;
CREATE VIEW electronic_records_view AS
SELECT 
    p.id as patient_id,
    p.full_name as patient_name,
    p.cpf,
    p.sus_card,
    p.birth_date,
    p.gender,
    p.blood_type,
    p.allergies,
    p.chronic_conditions,
    p.status as patient_status,
    p.priority as patient_priority,
    mr.id as record_id,
    mr.complaint,
    mr.diagnosis,
    mr.prescription,
    mr.observations,
    mr.attachments,
    mr.created_at as record_date,
    mr.status as record_status,
    prof.id as professional_id,
    prof.full_name as professional_name,
    prof.specialty as professional_specialty
FROM patients p
LEFT JOIN medical_records mr ON p.id = mr.patient_id
LEFT JOIN professionals prof ON mr.professional_id = prof.id
WHERE p.active = true
ORDER BY mr.created_at DESC;

-- Criar view para triagem
DROP VIEW IF EXISTS triage_view CASCADE;
CREATE VIEW triage_view AS
SELECT 
    t.*,
    p.full_name as patient_name,
    p.cpf,
    p.sus_card,
    prof.full_name as professional_name,
    prof.specialty as professional_specialty
FROM triage t
JOIN patients p ON t.patient_id = p.id
LEFT JOIN professionals prof ON t.professional_id = prof.id
ORDER BY t.created_at DESC;

-- Criar view para exames
DROP VIEW IF EXISTS exams_view CASCADE;
CREATE VIEW exams_view AS
SELECT 
    e.*,
    p.full_name as patient_name,
    p.cpf,
    p.sus_card,
    prof.full_name as professional_name,
    prof.specialty as professional_specialty,
    u.raw_user_meta_data->>'full_name' as requested_by_name
FROM exams e
JOIN patients p ON e.patient_id = p.id
LEFT JOIN professionals prof ON e.professional_id = prof.id
LEFT JOIN auth.users u ON e.requested_by = u.id
ORDER BY e.created_at DESC; 