-- Remover as funções antigas
DROP FUNCTION IF EXISTS generate_patient_ticket(uuid, text);
DROP FUNCTION IF EXISTS search_patients_for_ticket(text);
DROP VIEW IF EXISTS patient_details;

-- Recriar a função de geração de senha
CREATE OR REPLACE FUNCTION generate_patient_ticket(
    p_patient_id uuid,
    p_priority text DEFAULT 'normal'::text
) RETURNS TABLE (
    ticket_id uuid,
    ticket_number text,
    patient_name text,
    status text,
    priority text
) AS $$
DECLARE
    v_ticket_number text;
BEGIN
    -- Gerar o número da senha primeiro
    v_ticket_number := generate_ticket_number('triagem');
    
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
        SELECT 
            v_ticket_number,
            p.id,
            p.full_name,
            'triagem'::queue_service_type,
            p_priority,
            'waiting'::queue_status,
            'triagem'
        FROM patients p
        WHERE p.id = p_patient_id
        RETURNING 
            queue_tickets.id as ticket_id,
            queue_tickets.ticket_number,
            queue_tickets.patient_name,
            queue_tickets.status::text,
            queue_tickets.priority
    )
    SELECT * FROM new_ticket;
END;
$$ LANGUAGE plpgsql;

-- Recriar a função de busca de pacientes
CREATE OR REPLACE FUNCTION search_patients_for_ticket(
    search_term text,
    page_size integer DEFAULT 10,
    page_number integer DEFAULT 1
) RETURNS TABLE (
    id uuid,
    full_name text,
    birth_date date,
    cpf text,
    phone text,
    has_active_ticket boolean,
    active_ticket_number text,
    active_ticket_status text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.birth_date,
        p.cpf,
        p.phone,
        CASE 
            WHEN qt.id IS NOT NULL THEN true 
            ELSE false 
        END as has_active_ticket,
        qt.ticket_number as active_ticket_number,
        qt.status::text as active_ticket_status
    FROM patients p
    LEFT JOIN LATERAL (
        SELECT qt.id, qt.ticket_number, qt.status
        FROM queue_tickets qt
        WHERE qt.patient_id = p.id
        AND qt.status IN ('waiting', 'called', 'in_service')
        ORDER BY qt.created_at DESC
        LIMIT 1
    ) qt ON true
    WHERE 
        p.full_name ILIKE '%' || search_term || '%'
        OR p.cpf LIKE '%' || search_term || '%'
    ORDER BY 
        p.full_name
    LIMIT page_size
    OFFSET (page_number - 1) * page_size;
END;
$$ LANGUAGE plpgsql;

-- Recriar a view de detalhes do paciente
CREATE OR REPLACE VIEW patient_details AS 
WITH patient_queue_info AS (
    SELECT 
        patient_id,
        COUNT(*) as total_visits,
        MAX(CASE WHEN status IN ('waiting', 'called', 'in_service') THEN status::text END) as current_status,
        MAX(CASE WHEN status IN ('waiting', 'called', 'in_service') THEN ticket_number END) as current_ticket
    FROM queue_tickets
    GROUP BY patient_id
)
SELECT 
    p.id,
    p.full_name,
    p.birth_date,
    p.gender,
    p.cpf,
    p.rg,
    p.sus_card,
    p.phone,
    p.address,
    p.emergency_contact,
    p.created_at,
    p.updated_at,
    COALESCE(pqi.total_visits, 0) as total_visits,
    pqi.current_status,
    pqi.current_ticket
FROM patients p
LEFT JOIN patient_queue_info pqi ON p.id = pqi.patient_id; 