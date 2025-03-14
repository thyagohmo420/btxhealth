-- Adicionar novos campos na tabela medical_records
ALTER TABLE medical_records
ADD COLUMN IF NOT EXISTS prescription TEXT,
ADD COLUMN IF NOT EXISTS exam_request TEXT;

-- Atualizar a view medical_records_view
DROP VIEW IF EXISTS medical_records_view;
CREATE VIEW medical_records_view AS
SELECT 
    mr.*,
    p.full_name as patient_name,
    p.cpf as patient_cpf,
    prof.full_name as professional_name,
    prof.specialty as professional_specialty
FROM medical_records mr
JOIN patients p ON p.id = mr.patient_id
JOIN professionals prof ON prof.id = mr.professional_id; 