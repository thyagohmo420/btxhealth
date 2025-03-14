-- Verificar e recriar a tabela medical_records se necessário
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    professional_id UUID REFERENCES professionals(id) NOT NULL,
    complaint TEXT,
    diagnosis TEXT,
    prescription TEXT,
    observations TEXT,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Verificar e recriar a tabela exams se necessário
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

-- Garantir que as políticas existam
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- Recriar políticas para medical_records
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

-- Recriar políticas para exams
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

-- Recriar a view
DROP VIEW IF EXISTS patient_medical_records;
CREATE OR REPLACE VIEW patient_medical_records AS
WITH medical_history AS (
    SELECT 
        patient_id,
        json_agg(
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
        ) as records
    FROM medical_records mr
    LEFT JOIN professionals prof ON mr.professional_id = prof.id
    GROUP BY patient_id
),
triage_history AS (
    SELECT 
        patient_id,
        json_agg(
            json_build_object(
                'id', t.id,
                'date', t.created_at,
                'priority', t.priority,
                'vital_signs', t.vital_signs,
                'symptoms', t.symptoms,
                'notes', t.notes
            ) ORDER BY t.created_at DESC
        ) as triages
    FROM triage t
    GROUP BY patient_id
),
exam_history AS (
    SELECT 
        patient_id,
        json_agg(
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
        ) as exams
    FROM exams e
    GROUP BY patient_id
)
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
    COALESCE(mh.records, '[]'::json) as medical_records,
    COALESCE(th.triages, '[]'::json) as triage_history,
    COALESCE(eh.exams, '[]'::json) as exam_history
FROM patients p
LEFT JOIN medical_history mh ON p.id = mh.patient_id
LEFT JOIN triage_history th ON p.id = th.patient_id
LEFT JOIN exam_history eh ON p.id = eh.patient_id
WHERE p.active = true; 