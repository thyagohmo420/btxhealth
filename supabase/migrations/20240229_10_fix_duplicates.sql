-- Função atualizada para buscar pacientes elegíveis para regulação sem duplicatas
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
    WITH combined_patients AS (
        -- Pacientes da triagem
        SELECT
            p.id,
            p.full_name,
            p.cpf,
            'Triagem'::text as origin,
            t.created_at as last_update,
            1 as priority -- Prioridade mais alta para triagem
        FROM patients p
        JOIN triage t ON t.patient_id = p.id
        WHERE t.status = 'completed'
        AND p.active = true

        UNION ALL

        -- Pacientes com prontuário
        SELECT
            p.id,
            p.full_name,
            p.cpf,
            'Prontuário'::text as origin,
            mr.created_at as last_update,
            2 as priority -- Prioridade média para prontuário
        FROM patients p
        JOIN medical_records mr ON mr.patient_id = p.id
        WHERE mr.status = 'active'
        AND p.active = true

        UNION ALL

        -- Pacientes aguardando atendimento
        SELECT
            p.id,
            p.full_name,
            p.cpf,
            'Em Espera'::text as origin,
            p.created_at as last_update,
            3 as priority -- Prioridade mais baixa para espera
        FROM patients p
        WHERE p.status = 'waiting'
        AND p.active = true
    )
    SELECT DISTINCT ON (id)
        id,
        full_name,
        cpf,
        origin,
        last_update
    FROM combined_patients
    ORDER BY id, priority, last_update DESC;
END;
$$ LANGUAGE plpgsql; 