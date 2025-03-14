-- Drop existing function
DROP FUNCTION IF EXISTS public.generate_patient_ticket_and_print(uuid, text);

-- Recreate function with correct status handling
CREATE FUNCTION public.generate_patient_ticket_and_print(
    p_patient_id uuid,
    p_priority text DEFAULT 'normal'::text
)
RETURNS TABLE(
    ticket_number text,
    patient_name text,
    room text,
    status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_ticket_number text;
    v_patient_name text;
    v_room text;
    v_status queue_status;
    v_active_ticket record;
BEGIN
    -- Verificar se já existe uma senha ativa para o paciente
    SELECT * INTO v_active_ticket
    FROM queue_tickets qt
    WHERE qt.patient_id = p_patient_id
    AND qt.status IN ('em_espera', 'triagem', 'em_atendimento');

    IF v_active_ticket IS NOT NULL THEN
        RETURN QUERY
        SELECT 
            v_active_ticket.ticket_number,
            p.full_name,
            v_active_ticket.room,
            v_active_ticket.status::text
        FROM patients p
        WHERE p.id = p_patient_id;
        RETURN;
    END IF;

    -- Gerar nova senha
    SELECT 
        CASE 
            WHEN p_priority = 'emergency' THEN 'E'
            WHEN p_priority = 'priority' THEN 'P'
            ELSE 'N'
        END || 
        LPAD(COALESCE(
            (SELECT COUNT(*) + 1 
            FROM queue_tickets 
            WHERE DATE(called_at) = CURRENT_DATE
            AND ticket_number LIKE 
                CASE 
                    WHEN p_priority = 'emergency' THEN 'E%'
                    WHEN p_priority = 'priority' THEN 'P%'
                    ELSE 'N%'
                END
            )::text,
            '1'
        ), 3, '0')
    INTO v_ticket_number;

    -- Definir sala inicial como TRIAGEM_01
    v_room := 'TRIAGEM_01';
    v_status := 'em_espera'::queue_status;

    -- Inserir nova senha
    INSERT INTO queue_tickets (
        ticket_number,
        patient_id,
        priority,
        room,
        status
    )
    VALUES (
        v_ticket_number,
        p_patient_id,
        p_priority,
        v_room,
        v_status
    );

    -- Retornar dados da senha
    RETURN QUERY
    SELECT 
        v_ticket_number,
        p.full_name,
        v_room,
        v_status::text
    FROM patients p
    WHERE p.id = p_patient_id;
END;
$function$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.generate_patient_ticket_and_print(uuid, text) TO anon;

COMMIT; 