-- Função para verificar os dados da triagem
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
            COUNT(*) FILTER (WHERE status = 'completed') as completed,
            COUNT(DISTINCT patient_id) as unique_patients,
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

-- Função para atualizar status das triagens antigas para 'completed'
CREATE OR REPLACE FUNCTION update_old_triage_status()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE triage
    SET status = 'completed'
    WHERE status = 'waiting'
    AND created_at < NOW() - INTERVAL '1 day';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql; 