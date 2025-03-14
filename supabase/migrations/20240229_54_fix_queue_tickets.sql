-- Remover views que dependem da coluna patient_name
DROP VIEW IF EXISTS reception_view CASCADE;
DROP VIEW IF EXISTS queue_display CASCADE;
DROP VIEW IF EXISTS queue_history CASCADE;
DROP VIEW IF EXISTS medical_records CASCADE;
DROP VIEW IF EXISTS patient_queue CASCADE;
DROP VIEW IF EXISTS triage_queue CASCADE;
DROP VIEW IF EXISTS patient_details CASCADE;

-- Remover a coluna patient_name da tabela queue_tickets
ALTER TABLE queue_tickets 
DROP COLUMN IF EXISTS patient_name;

-- Recriar a view reception_view
CREATE OR REPLACE VIEW reception_view AS
SELECT 
    p.id AS patient_id,
    p.full_name AS patient_name,
    p.cpf,
    p.birth_date,
    p.phone,
    p.email,
    p.created_at AS registration_date,
    qt.id AS ticket_id,
    qt.ticket_number,
    qt.status,
    qt.priority,
    qt.room,
    qt.created_at AS ticket_created_at
FROM patients p
LEFT JOIN LATERAL (
    SELECT *
    FROM queue_tickets qt
    WHERE qt.patient_id = p.id
    AND qt.created_at::date = CURRENT_DATE
    ORDER BY qt.created_at DESC
    LIMIT 1
) qt ON true;

-- Recriar a view queue_display
CREATE OR REPLACE VIEW queue_display AS
SELECT 
    qt.id,
    qt.ticket_number,
    p.full_name AS patient_name,
    qt.room,
    CASE 
        WHEN qt.room LIKE 'TRIAGEM%' THEN 'Triagem'
        WHEN qt.room LIKE 'ATENDIMENTO%' THEN 'Consultório'
        ELSE qt.room
    END AS room_display,
    qt.status,
    CASE 
        WHEN qt.status = 'em_espera' THEN 'Em Espera'
        WHEN qt.status = 'triagem' THEN 'Em Triagem'
        WHEN qt.status = 'em_atendimento' THEN 'Em Atendimento'
        WHEN qt.status = 'concluido' THEN 'Concluído'
        ELSE qt.status::text
    END AS status_display,
    qt.priority,
    qt.called_at,
    qt.created_at
FROM queue_tickets qt
JOIN patients p ON p.id = qt.patient_id
WHERE qt.created_at::date = CURRENT_DATE
ORDER BY 
    CASE qt.priority
        WHEN 'emergency' THEN 1
        WHEN 'priority' THEN 2
        ELSE 3
    END,
    qt.created_at;

-- Atualizar a função call_next_ticket para resolver a ambiguidade do status
CREATE OR REPLACE FUNCTION public.call_next_ticket(
    p_room text,
    p_current_ticket_id uuid DEFAULT NULL
)
RETURNS TABLE(
    id uuid,
    ticket_number text,
    patient_name text,
    room text,
    status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_next_ticket record;
    v_new_status queue_status;
BEGIN
    -- Definir novo status com base na sala
    v_new_status := CASE
        WHEN p_room LIKE 'TRIAGEM%' THEN 'triagem'::queue_status
        WHEN p_room LIKE 'ATENDIMENTO%' THEN 'em_atendimento'::queue_status
        ELSE 'em_espera'::queue_status
    END;

    -- Se houver uma senha atual, marcar como concluída
    IF p_current_ticket_id IS NOT NULL THEN
        UPDATE queue_tickets qt
        SET status = 'concluido'::queue_status,
            completed_at = NOW()
        WHERE qt.id = p_current_ticket_id;
    END IF;

    -- Buscar próxima senha
    SELECT 
        qt.id,
        qt.ticket_number,
        p.full_name,
        qt.room,
        qt.status::text
    INTO v_next_ticket
    FROM queue_tickets qt
    JOIN patients p ON p.id = qt.patient_id
    WHERE qt.status = 'em_espera'
    ORDER BY 
        CASE qt.priority
            WHEN 'emergency' THEN 1
            WHEN 'priority' THEN 2
            ELSE 3
        END,
        qt.created_at
    LIMIT 1;

    -- Se encontrou uma senha, atualizar sala e status
    IF v_next_ticket.id IS NOT NULL THEN
        UPDATE queue_tickets qt
        SET room = p_room,
            status = v_new_status,
            called_at = NOW()
        WHERE qt.id = v_next_ticket.id;

        RETURN QUERY
        SELECT 
            qt.id,
            qt.ticket_number,
            p.full_name,
            qt.room,
            qt.status::text
        FROM queue_tickets qt
        JOIN patients p ON p.id = qt.patient_id
        WHERE qt.id = v_next_ticket.id;
    END IF;
END;
$function$;

-- Garantir permissões
GRANT EXECUTE ON FUNCTION public.call_next_ticket(text, uuid) TO anon;

COMMIT; 