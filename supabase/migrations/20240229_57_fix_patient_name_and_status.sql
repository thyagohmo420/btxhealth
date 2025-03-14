-- Permitir NULL na coluna patient_name
ALTER TABLE queue_tickets 
ALTER COLUMN patient_name DROP NOT NULL;

-- Atualizar a função call_next_ticket
CREATE OR REPLACE FUNCTION public.call_next_ticket(p_room text)
RETURNS TABLE (
    ticket_id uuid,
    ticket_number text,
    patient_name text,
    priority text,
    new_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_current_ticket record;
    v_next_ticket record;
BEGIN
    -- Buscar ticket atual na sala (se houver)
    SELECT 
        qt.id,
        qt.ticket_number,
        qt.room,
        qt.status::text as current_status
    INTO v_current_ticket
    FROM queue_tickets qt
    WHERE qt.room = p_room 
    AND qt.status IN ('triagem', 'em_atendimento')
    AND qt.created_at::date = CURRENT_DATE
    ORDER BY qt.called_at DESC
    LIMIT 1;

    -- Se existe ticket atual, finalizar
    IF v_current_ticket.id IS NOT NULL THEN
        UPDATE queue_tickets 
        SET status = 'concluido'::queue_status
        WHERE id = v_current_ticket.id;
    END IF;

    -- Buscar próximo ticket
    WITH next_ticket AS (
        UPDATE queue_tickets qt
        SET 
            status = (
                CASE 
                    WHEN p_room LIKE 'TRIAGEM%' THEN 'triagem'::queue_status
                    ELSE 'em_atendimento'::queue_status
                END
            ),
            room = p_room,
            called_at = NOW()
        WHERE qt.id = (
            SELECT qt2.id
            FROM queue_tickets qt2
            WHERE qt2.created_at::date = CURRENT_DATE
            AND qt2.status = 'em_espera'
            ORDER BY 
                CASE qt2.priority
                    WHEN 'emergency' THEN 1
                    WHEN 'priority' THEN 2
                    ELSE 3
                END,
                qt2.created_at
            LIMIT 1
        )
        RETURNING 
            id,
            ticket_number,
            patient_id,
            priority,
            status::text as current_status
    )
    SELECT 
        nt.id,
        nt.ticket_number,
        p.full_name,
        nt.priority::text,
        nt.current_status
    INTO v_next_ticket
    FROM next_ticket nt
    JOIN patients p ON p.id = nt.patient_id;

    IF v_next_ticket.id IS NULL THEN
        RAISE EXCEPTION 'Não há senhas em espera';
    END IF;

    RETURN QUERY
    SELECT 
        v_next_ticket.id,
        v_next_ticket.ticket_number,
        v_next_ticket.full_name,
        v_next_ticket.priority,
        v_next_ticket.current_status;
END;
$function$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.call_next_ticket(text) TO anon;

COMMIT; 