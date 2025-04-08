-- Melhorias nas tabelas de pacientes e registros médicos para integração
ALTER TABLE medical_records
ADD COLUMN IF NOT EXISTS date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS doctor TEXT,
ADD COLUMN IF NOT EXISTS diagnosis TEXT,
ADD COLUMN IF NOT EXISTS symptoms TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS sent_to_nursing BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sent_to_laboratory BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS needs_medication BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS needs_laboratory_exams BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS nursing_notes TEXT,
ADD COLUMN IF NOT EXISTS nursing_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS laboratory_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS laboratory_notes TEXT;

-- Tabela para procedimentos de enfermagem
CREATE TABLE IF NOT EXISTS nursing_procedures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed')),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Visão para mostrar pacientes com prontuários pendentes para enfermagem
CREATE OR REPLACE VIEW nursing_pending_records AS
SELECT 
  mr.id AS record_id,
  p.id AS patient_id,
  p.full_name,
  p.birth_date,
  p.cpf,
  p.phone,
  COALESCE(mr.date, mr.created_at) AS record_date,
  mr.doctor,
  mr.diagnosis,
  mr.symptoms,
  mr.sent_to_nursing,
  mr.needs_medication
FROM 
  medical_records mr
JOIN 
  patients p ON mr.patient_id = p.id
WHERE 
  mr.sent_to_nursing = true 
  AND mr.needs_medication = true
  AND mr.nursing_completed_at IS NULL;

-- Visão para mostrar pacientes com exames pendentes para laboratório
CREATE OR REPLACE VIEW laboratory_pending_records AS
SELECT 
  mr.id AS record_id,
  p.id AS patient_id,
  p.full_name,
  p.birth_date,
  p.cpf,
  p.phone,
  COALESCE(mr.date, mr.created_at) AS record_date,
  mr.doctor,
  mr.diagnosis,
  mr.symptoms,
  mr.sent_to_laboratory,
  mr.needs_laboratory_exams
FROM 
  medical_records mr
JOIN 
  patients p ON mr.patient_id = p.id
WHERE 
  mr.sent_to_laboratory = true 
  AND mr.needs_laboratory_exams = true
  AND mr.laboratory_completed_at IS NULL;

-- Visão para mostrar histórico completo de pacientes incluindo todos os departamentos
CREATE OR REPLACE VIEW patient_complete_history AS
SELECT
  p.id AS patient_id,
  p.full_name,
  p.birth_date,
  p.cpf,
  mr.id AS record_id,
  COALESCE(mr.date, mr.created_at) AS consultation_date,
  mr.doctor,
  mr.diagnosis,
  mr.symptoms,
  mr.notes AS medical_notes,
  mr.nursing_notes,
  mr.nursing_completed_at,
  mr.laboratory_notes,
  mr.laboratory_completed_at,
  mr.created_at,
  mr.updated_at,
  p.status AS patient_status
FROM
  medical_records mr
JOIN
  patients p ON mr.patient_id = p.id
ORDER BY
  p.id, COALESCE(mr.date, mr.created_at) DESC;

-- Atualizar restrição de gênero na tabela patients
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_gender_check;

-- Adicionar nova restrição com valores válidos
ALTER TABLE patients ADD CONSTRAINT patients_gender_check 
  CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));

-- Comentário para documentação
COMMENT ON COLUMN patients.gender IS 'Gênero do paciente: male (masculino), female (feminino), other (outro), prefer_not_to_say (prefere não informar)'; 