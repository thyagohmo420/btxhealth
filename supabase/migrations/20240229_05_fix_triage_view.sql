-- Recriar a view triage_view
DROP VIEW IF EXISTS triage_view CASCADE;

CREATE VIEW triage_view AS
SELECT 
    t.id,
    t.patient_id,
    t.professional_id,
    t.vital_signs,
    t.symptoms,
    t.notes,
    t.status,
    t.priority,
    t.created_at,
    t.updated_at,
    p.full_name as patient_name,
    p.cpf as patient_cpf,
    p.sus_card as patient_sus_card,
    p.birth_date as patient_birth_date,
    p.gender as patient_gender,
    p.blood_type as patient_blood_type,
    p.allergies as patient_allergies,
    p.chronic_conditions as patient_chronic_conditions,
    prof.full_name as professional_name,
    prof.specialty as professional_specialty
FROM triage t
JOIN patients p ON t.patient_id = p.id
JOIN professionals prof ON t.professional_id = prof.id
ORDER BY 
    CASE t.priority
        WHEN 'emergency' THEN 1
        WHEN 'urgent' THEN 2
        WHEN 'high' THEN 3
        WHEN 'normal' THEN 4
        WHEN 'low' THEN 5
    END,
    t.created_at DESC; 