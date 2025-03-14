-- Função atualizada para buscar pacientes elegíveis para regulação
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
    -- Pacientes da triagem
    SELECT DISTINCT ON (p.id)
        p.id,
        p.full_name,
        p.cpf,
        'Triagem'::text as origin,
        t.created_at as last_update
    FROM patients p
    JOIN triage t ON t.patient_id = p.id
    WHERE t.status = 'completed'
    AND p.active = true

    UNION ALL

    -- Pacientes com prontuário
    SELECT DISTINCT ON (p.id)
        p.id,
        p.full_name,
        p.cpf,
        'Prontuário'::text as origin,
        mr.created_at as last_update
    FROM patients p
    JOIN medical_records mr ON mr.patient_id = p.id
    WHERE mr.status = 'active'
    AND p.active = true

    UNION ALL

    -- Pacientes aguardando atendimento
    SELECT DISTINCT ON (p.id)
        p.id,
        p.full_name,
        p.cpf,
        'Em Espera'::text as origin,
        p.created_at as last_update
    FROM patients p
    WHERE p.status = 'waiting'
    AND p.active = true

    ORDER BY last_update DESC;
END;
$$ LANGUAGE plpgsql; 