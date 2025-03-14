BEGIN;

-- View para listar pacientes na recepção
CREATE OR REPLACE VIEW reception_patients AS
SELECT 
    p.id,
    p.full_name,
    p.cpf,
    p.birth_date,
    p.sus_card,
    p.phone,
    CASE 
        WHEN qt.status IS NULL THEN 'waiting'::queue_status
        ELSE qt.status
    END as ticket_status,
    qt.ticket_number,
    qt.priority
FROM patients p
LEFT JOIN queue_tickets qt ON 
    qt.patient_id = p.id AND 
    qt.created_at::date = CURRENT_DATE AND
    qt.status NOT IN ('completed', 'cancelled')
ORDER BY 
    CASE 
        WHEN qt.status IS NULL THEN 1
        WHEN qt.status = 'waiting' THEN 2
        ELSE 3
    END,
    p.full_name;

-- Função para buscar pacientes para gerar senha
CREATE OR REPLACE FUNCTION search_patients_for_ticket(search_term text)
RETURNS TABLE (
    id uuid,
    full_name text,
    cpf text,
    birth_date date,
    has_active_ticket boolean,
    current_ticket text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.cpf,
        p.birth_date,
        COALESCE(qt.status NOT IN ('completed', 'cancelled'), false) as has_active_ticket,
        qt.ticket_number as current_ticket
    FROM patients p
    LEFT JOIN queue_tickets qt ON 
        qt.patient_id = p.id AND 
        qt.created_at::date = CURRENT_DATE AND
        qt.status NOT IN ('completed', 'cancelled')
    WHERE 
        p.full_name ILIKE '%' || search_term || '%' OR
        p.cpf LIKE '%' || search_term || '%'
    ORDER BY 
        CASE 
            WHEN p.full_name ILIKE search_term || '%' THEN 1
            WHEN p.full_name ILIKE '%' || search_term || '%' THEN 2
            ELSE 3
        END,
        p.full_name;
END;
$$;

-- Função para gerar senha para um paciente
CREATE OR REPLACE FUNCTION generate_patient_ticket(
    p_patient_id uuid,
    p_priority text DEFAULT 'normal'
)
RETURNS TABLE (
    ticket_id uuid,
    ticket_number text,
    patient_name text,
    priority text,
    status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_ticket_number text;
    v_patient_name text;
BEGIN
    -- Verificar se o paciente já tem uma senha ativa
    IF EXISTS (
        SELECT 1 
        FROM queue_tickets 
        WHERE patient_id = p_patient_id 
        AND created_at::date = CURRENT_DATE
        AND status NOT IN ('completed', 'cancelled')
    ) THEN
        RAISE EXCEPTION 'Paciente já possui uma senha ativa hoje';
    END;

    -- Buscar nome do paciente
    SELECT full_name INTO v_patient_name
    FROM patients
    WHERE id = p_patient_id;

    -- Gerar número da senha
    SELECT generate_ticket_number('triagem') INTO v_ticket_number;

    -- Criar a senha
    RETURN QUERY
    WITH new_ticket AS (
        INSERT INTO queue_tickets (
            ticket_number,
            patient_id,
            patient_name,
            service_type,
            priority,
            status,
            current_sector
        )
        VALUES (
            v_ticket_number,
            p_patient_id,
            v_patient_name,
            'triagem',
            p_priority,
            'waiting',
            'triagem'
        )
        RETURNING id, ticket_number, patient_name, priority, status::text
    )
    SELECT * FROM new_ticket;
END;
$$;

-- Garantir permissões
GRANT SELECT ON reception_patients TO anon;
GRANT EXECUTE ON FUNCTION search_patients_for_ticket(text) TO anon;
GRANT EXECUTE ON FUNCTION generate_patient_ticket(uuid, text) TO anon;

COMMIT; 