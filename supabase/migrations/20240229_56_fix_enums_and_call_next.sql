-- Criar o tipo enum ticket_priority se não existir
DO $$ BEGIN
    CREATE TYPE public.ticket_priority AS ENUM ('normal', 'priority', 'emergency');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Atualizar a função generate_patient_ticket_and_print
CREATE OR REPLACE FUNCTION public.generate_patient_ticket_and_print(
    p_patient_id uuid,
    p_priority text DEFAULT 'normal'
)
RETURNS TABLE (
    id uuid,
    ticket_number text,
    patient_name text,
    priority text,
    status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_active_ticket record;
    v_ticket_count integer;
    v_new_ticket record;
BEGIN
    -- Check if patient already has an active ticket
    SELECT qt.* INTO v_active_ticket
    FROM queue_tickets qt
    WHERE qt.patient_id = p_patient_id
    AND qt.created_at::date = CURRENT_DATE
    AND qt.status != 'concluido';

    IF v_active_ticket.id IS NOT NULL THEN
        RAISE EXCEPTION 'Paciente já possui uma senha ativa hoje: %', v_active_ticket.ticket_number;
    END IF;

    -- Get count of tickets for today
    SELECT COUNT(*) + 1 INTO v_ticket_count
    FROM queue_tickets qt
    WHERE qt.created_at::date = CURRENT_DATE;

    -- Insert new ticket
    INSERT INTO queue_tickets (
        patient_id,
        ticket_number,
        priority,
        status,
        created_at
    )
    VALUES (
        p_patient_id,
        CASE p_priority
            WHEN 'emergency' THEN 'E'
            WHEN 'priority' THEN 'P'
            ELSE 'N'
        END || LPAD(v_ticket_count::text, 3, '0'),
        p_priority::ticket_priority,
        'em_espera'::queue_status,
        NOW()
    )
    RETURNING * INTO v_new_ticket;

    -- Return ticket info
    RETURN QUERY
    SELECT 
        qt.id,
        qt.ticket_number,
        p.full_name,
        qt.priority::text,
        qt.status::text
    FROM queue_tickets qt
    JOIN patients p ON p.id = qt.patient_id
    WHERE qt.id = v_new_ticket.id;
END;
$function$;

-- Atualizar a função call_next_ticket para resolver ambiguidade do status
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
    SELECT qt.* INTO v_current_ticket
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
            status = CASE 
                WHEN p_room LIKE 'TRIAGEM%' THEN 'triagem'::queue_status
                ELSE 'em_atendimento'::queue_status
            END,
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
        RETURNING *
    )
    SELECT 
        nt.id,
        nt.ticket_number,
        p.full_name,
        nt.priority::text,
        nt.status::text as new_status
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
        v_next_ticket.patient_name,
        v_next_ticket.priority,
        v_next_ticket.new_status;
END;
$function$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.generate_patient_ticket_and_print(uuid, text) TO anon;
GRANT EXECUTE ON FUNCTION public.call_next_ticket(text) TO anon;

COMMIT; 