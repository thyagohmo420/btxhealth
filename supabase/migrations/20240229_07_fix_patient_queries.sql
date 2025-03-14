-- Corrigir a função de verificação de triagem
CREATE OR REPLACE FUNCTION check_triage_data()
RETURNS TABLE (
    total_triage bigint,
    completed_triage bigint,
    patients_with_triage bigint,
    sample_data jsonb
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE t.status = 'completed') as completed,
            COUNT(DISTINCT t.patient_id) as unique_patients,
            jsonb_agg(
                jsonb_build_object(
                    'id', t.id,
                    'patient_id', t.patient_id,
                    'status', t.status,
                    'patient_name', p.full_name,
                    'created_at', t.created_at
                )
            ) as samples
        FROM (
            SELECT *
            FROM triage
            ORDER BY created_at DESC
            LIMIT 5
        ) t
        JOIN patients p ON t.patient_id = p.id
    )
    SELECT 
        total,
        completed,
        unique_patients,
        samples
    FROM stats;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar pacientes elegíveis para regulação
CREATE OR REPLACE FUNCTION get_regulation_eligible_patients()
RETURNS TABLE (
    id uuid,
    full_name text,
    cpf text,
    origin text,
    last_update timestamptz
) AS $$
BEGIN
    RETURN QUERY
    -- Pacientes da triagem com status completed
    SELECT DISTINCT ON (p.id)
        p.id,
        p.full_name,
        p.cpf,
        'Triagem'::text as origin,
        t.created_at as last_update
    FROM patients p
    JOIN triage t ON t.patient_id = p.id
    WHERE t.status = 'completed'

    UNION ALL

    -- Pacientes com prontuário ativo
    SELECT DISTINCT ON (p.id)
        p.id,
        p.full_name,
        p.cpf,
        'Prontuário'::text as origin,
        mr.created_at as last_update
    FROM patients p
    JOIN medical_records mr ON mr.patient_id = p.id
    WHERE mr.status = 'active'

    UNION ALL

    -- Pacientes da recepção com status confirmado
    SELECT DISTINCT ON (p.id)
        p.id,
        p.full_name,
        p.cpf,
        'Recepção'::text as origin,
        r.created_at as last_update
    FROM patients p
    JOIN reception r ON r.patient_id = p.id
    WHERE r.status = 'confirmed'

    ORDER BY last_update DESC;
END;
$$ LANGUAGE plpgsql; 