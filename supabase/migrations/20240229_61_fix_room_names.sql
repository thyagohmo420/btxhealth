-- Drop existing function
DROP FUNCTION IF EXISTS public.call_next_ticket(text);

-- Create simplified function
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
AS $$
DECLARE
    v_next_ticket record;
BEGIN
    -- Buscar e atualizar próximo ticket em uma única operação
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
            AND qt2.status = 'em_espera'::queue_status
            ORDER BY 
                CASE qt2.priority
                    WHEN 'emergency' THEN 1
                    WHEN 'priority' THEN 2
                    ELSE 3
                END,
                qt2.created_at
            LIMIT 1
        )
        RETURNING *
    )
    SELECT 
        nt.id,
        nt.ticket_number,
        p.full_name,
        nt.priority::text,
        nt.status::text
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
        v_next_ticket.status;
END;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.call_next_ticket(text) TO anon;

COMMIT; 