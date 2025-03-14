-- Primeiro, vamos garantir que a tabela medical_records existe
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    professional_id UUID REFERENCES professionals(id) NOT NULL,
    complaint TEXT,
    diagnosis TEXT,
    prescription TEXT,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Agora vamos adicionar a coluna attachments se ela não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'medical_records' 
        AND column_name = 'attachments'
    ) THEN
        ALTER TABLE medical_records ADD COLUMN attachments JSONB DEFAULT '[]';
    END IF;
END $$;

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_professional_id ON medical_records(professional_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_created_at ON medical_records(created_at);

-- Habilitar RLS
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
DROP POLICY IF EXISTS "Permitir leitura de prontuários para usuários autenticados" ON medical_records;
CREATE POLICY "Permitir leitura de prontuários para usuários autenticados"
ON medical_records FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Permitir inserção de prontuários para equipe médica" ON medical_records;
CREATE POLICY "Permitir inserção de prontuários para equipe médica"
ON medical_records FOR INSERT TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

DROP POLICY IF EXISTS "Permitir atualização de prontuários para equipe médica" ON medical_records;
CREATE POLICY "Permitir atualização de prontuários para equipe médica"
ON medical_records FOR UPDATE TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

-- Agora vamos recriar a view
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
                'attachments', COALESCE(mr.attachments, '[]'::jsonb)
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