-- Adicionar coluna attachments em medical_records
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';

-- Recriar view de prontuário com histórico médico integrado
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
                'observations', mr.observations,
                'attachments', mr.attachments
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
    ) as triage_history,
    COALESCE(
        (SELECT json_agg(
            json_build_object(
                'id', e.id,
                'type', e.type,
                'date', e.request_date,
                'result_date', e.result_date,
                'status', e.status,
                'result', e.result,
                'files', e.files,
                'requested_by', (
                    SELECT raw_user_meta_data->>'full_name' 
                    FROM auth.users 
                    WHERE id = e.requested_by
                )
            ) ORDER BY e.request_date DESC
        ) FROM exams e
        WHERE e.patient_id = p.id),
        '[]'::json
    ) as exam_history
FROM patients p
WHERE p.active = true;

-- Criar tabela de regulação ambulatorial se não existir
CREATE TABLE IF NOT EXISTS ambulatory_regulation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    professional_id UUID REFERENCES professionals(id) NOT NULL,
    specialty TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal',
    status TEXT NOT NULL DEFAULT 'pending',
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    approval_date DATE,
    approved_by UUID REFERENCES auth.users(id),
    notes TEXT,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_priority CHECK (priority IN ('emergency', 'urgent', 'high', 'normal', 'low')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
);

-- Criar view para regulação ambulatorial
CREATE OR REPLACE VIEW ambulatory_regulation_view AS
SELECT 
    ar.*,
    p.full_name as patient_name,
    p.cpf as patient_cpf,
    p.sus_card as patient_sus,
    p.birth_date as patient_birth_date,
    prof.full_name as professional_name,
    prof.specialty as professional_specialty,
    (
        SELECT raw_user_meta_data->>'full_name' 
        FROM auth.users 
        WHERE id = ar.approved_by
    ) as approved_by_name
FROM ambulatory_regulation ar
LEFT JOIN patients p ON ar.patient_id = p.id
LEFT JOIN professionals prof ON ar.professional_id = prof.id
ORDER BY 
    CASE 
        WHEN ar.priority = 'emergency' THEN 1
        WHEN ar.priority = 'urgent' THEN 2
        WHEN ar.priority = 'high' THEN 3
        WHEN ar.priority = 'normal' THEN 4
        WHEN ar.priority = 'low' THEN 5
    END,
    ar.request_date DESC;

-- Criar função para atualizar status da regulação
CREATE OR REPLACE FUNCTION update_regulation_status()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    
    IF NEW.status IN ('approved', 'rejected') AND OLD.status = 'pending' THEN
        NEW.approval_date = CURRENT_DATE;
        NEW.approved_by = auth.uid();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualização de status da regulação
DROP TRIGGER IF EXISTS update_regulation_status_trigger ON ambulatory_regulation;
CREATE TRIGGER update_regulation_status_trigger
    BEFORE UPDATE ON ambulatory_regulation
    FOR EACH ROW
    EXECUTE FUNCTION update_regulation_status();

-- Criar políticas para regulação ambulatorial
ALTER TABLE ambulatory_regulation ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON ambulatory_regulation;
CREATE POLICY "Permitir leitura para usuários autenticados"
ON ambulatory_regulation FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Permitir inserção para equipe médica" ON ambulatory_regulation;
CREATE POLICY "Permitir inserção para equipe médica"
ON ambulatory_regulation FOR INSERT TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

DROP POLICY IF EXISTS "Permitir atualização para reguladores" ON ambulatory_regulation;
CREATE POLICY "Permitir atualização para reguladores"
ON ambulatory_regulation FOR UPDATE TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'regulator']));

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_ambulatory_regulation_patient_id ON ambulatory_regulation(patient_id);
CREATE INDEX IF NOT EXISTS idx_ambulatory_regulation_professional_id ON ambulatory_regulation(professional_id);
CREATE INDEX IF NOT EXISTS idx_ambulatory_regulation_status ON ambulatory_regulation(status);
CREATE INDEX IF NOT EXISTS idx_ambulatory_regulation_priority ON ambulatory_regulation(priority);

-- Atualizar trigger de triagem para atualizar status do paciente
CREATE OR REPLACE FUNCTION update_patient_triage_status()
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
$$ LANGUAGE plpgsql;

-- Criar trigger para atualização de status do paciente na triagem
DROP TRIGGER IF EXISTS update_patient_triage_status_trigger ON triage;
CREATE TRIGGER update_patient_triage_status_trigger
    AFTER INSERT OR UPDATE ON triage
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_triage_status(); 