-- Função para atualizar status do paciente
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
$$ LANGUAGE plpgsql;

-- Trigger para atualizar status do paciente após triagem
DROP TRIGGER IF EXISTS update_patient_status_trigger ON triage;
CREATE TRIGGER update_patient_status_trigger
    AFTER INSERT OR UPDATE ON triage
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_status();

-- Verificar e atualizar a tabela triage
ALTER TABLE triage 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'waiting',
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal',
ADD CONSTRAINT valid_triage_status CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled')),
ADD CONSTRAINT valid_triage_priority CHECK (priority IN ('emergency', 'urgent', 'high', 'normal', 'low'));

-- Verificar e atualizar a tabela medical_records
ALTER TABLE medical_records 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD CONSTRAINT valid_record_status CHECK (status IN ('active', 'inactive', 'archived'));

-- Criar view para prontuário eletrônico
DROP VIEW IF EXISTS electronic_records_view;
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
    prof.full_name as professional_name,
    prof.specialty as professional_specialty
FROM patients p
LEFT JOIN medical_records mr ON p.id = mr.patient_id
LEFT JOIN professionals prof ON mr.professional_id = prof.id
WHERE p.active = true
ORDER BY mr.created_at DESC;

-- Criar função para download de exames
CREATE OR REPLACE FUNCTION get_exam_files(exam_id UUID)
RETURNS JSONB AS $$
BEGIN
    RETURN (
        SELECT files
        FROM exams
        WHERE id = exam_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar função para upload de exames
CREATE OR REPLACE FUNCTION update_exam_files(exam_id UUID, new_files JSONB)
RETURNS VOID AS $$
BEGIN
    UPDATE exams
    SET 
        files = new_files,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = exam_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar políticas
DROP POLICY IF EXISTS "Permitir leitura de prontuários eletrônicos" ON medical_records;
CREATE POLICY "Permitir leitura de prontuários eletrônicos"
ON medical_records FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Permitir criação de prontuários" ON medical_records;
CREATE POLICY "Permitir criação de prontuários"
ON medical_records FOR INSERT TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

DROP POLICY IF EXISTS "Permitir atualização de prontuários" ON medical_records;
CREATE POLICY "Permitir atualização de prontuários"
ON medical_records FOR UPDATE TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse'])); 