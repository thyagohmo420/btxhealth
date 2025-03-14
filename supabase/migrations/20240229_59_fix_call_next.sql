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
    v_current_ticket_id uuid;
    v_next_ticket_id uuid;
    v_next_status queue_status;
BEGIN
    -- Buscar ticket atual na sala (se houver)
    SELECT qt.id INTO v_current_ticket_id
    FROM queue_tickets qt
    WHERE qt.room = p_room 
    AND qt.status::text IN ('triagem', 'em_atendimento')
    AND qt.created_at::date = CURRENT_DATE
    ORDER BY qt.called_at DESC
    LIMIT 1;

    -- Se existe ticket atual, finalizar
    IF v_current_ticket_id IS NOT NULL THEN
        UPDATE queue_tickets 
        SET status = 'concluido'::queue_status
        WHERE id = v_current_ticket_id;
    END IF;

    -- Determinar próximo status baseado na sala
    v_next_status := CASE 
        WHEN p_room LIKE 'TRIAGEM%' THEN 'triagem'::queue_status
        ELSE 'em_atendimento'::queue_status
    END;

    -- Buscar ID do próximo ticket
    SELECT qt2.id INTO v_next_ticket_id
    FROM queue_tickets qt2
    WHERE qt2.created_at::date = CURRENT_DATE
    AND qt2.status = 'em_espera'::queue_status
    ORDER BY 
        CASE qt2.priority::text
            WHEN 'emergency' THEN 1
            WHEN 'priority' THEN 2
            ELSE 3
        END,
        qt2.created_at
    LIMIT 1;

    -- Se não encontrou próximo ticket
    IF v_next_ticket_id IS NULL THEN
        RAISE EXCEPTION 'Não há senhas em espera';
    END IF;

    -- Atualizar próximo ticket
    UPDATE queue_tickets 
    SET 
        status = v_next_status,
        room = p_room,
        called_at = NOW()
    WHERE id = v_next_ticket_id;

    -- Retornar informações do ticket atualizado
    RETURN QUERY
    SELECT 
        qt.id,
        qt.ticket_number,
        p.full_name,
        qt.priority::text,
        qt.status::text
    FROM queue_tickets qt
    JOIN patients p ON p.id = qt.patient_id
    WHERE qt.id = v_next_ticket_id;
END;
$function$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.call_next_ticket(text) TO anon;

COMMIT; 