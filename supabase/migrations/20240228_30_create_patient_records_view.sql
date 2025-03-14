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