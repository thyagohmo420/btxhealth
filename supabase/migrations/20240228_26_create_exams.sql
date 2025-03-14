-- Criar tabela de exames
CREATE TABLE IF NOT EXISTS exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    type TEXT NOT NULL,
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    result_date DATE,
    status TEXT NOT NULL DEFAULT 'pending',
    result TEXT,
    files JSONB DEFAULT '[]',
    requested_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'cancelled'))
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_exams_patient_id ON exams(patient_id);
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_exams_request_date ON exams(request_date);

-- Habilitar RLS
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
DROP POLICY IF EXISTS "Permitir leitura de exames para usuários autenticados" ON exams;
CREATE POLICY "Permitir leitura de exames para usuários autenticados"
ON exams FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Permitir inserção de exames para equipe médica" ON exams;
CREATE POLICY "Permitir inserção de exames para equipe médica"
ON exams FOR INSERT TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

DROP POLICY IF EXISTS "Permitir atualização de exames para equipe médica" ON exams;
CREATE POLICY "Permitir atualização de exames para equipe médica"
ON exams FOR UPDATE TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

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