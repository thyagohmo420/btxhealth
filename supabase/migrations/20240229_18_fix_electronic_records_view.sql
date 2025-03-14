-- Recriar a view electronic_records_view
DROP VIEW IF EXISTS electronic_records_view;
CREATE VIEW electronic_records_view AS
SELECT 
    mr.*,
    p.full_name as patient_name,
    p.cpf as patient_cpf,
    prof.full_name as professional_name,
    prof.specialty as professional_specialty
FROM medical_records mr
JOIN patients p ON p.id = mr.patient_id
JOIN professionals prof ON prof.id = mr.professional_id; 