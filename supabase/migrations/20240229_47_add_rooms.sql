-- Atualizar a função de geração de senhas para incluir as salas específicas
DROP FUNCTION IF EXISTS public.generate_patient_ticket_and_print(uuid, text);

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
    v_status text;
    v_active_ticket record;
BEGIN
    -- Verificar se já existe uma senha ativa para o paciente
    SELECT * INTO v_active_ticket
    FROM queue_tickets
    WHERE patient_id = p_patient_id
    AND status IN ('em_espera', 'triagem', 'em_atendimento');

    IF v_active_ticket IS NOT NULL THEN
        RETURN QUERY
        SELECT 
            v_active_ticket.ticket_number,
            p.full_name,
            v_active_ticket.room,
            v_active_ticket.status
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
            WHERE DATE(created_at) = CURRENT_DATE
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
    v_status := 'em_espera';

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
        v_status
    FROM patients p
    WHERE p.id = p_patient_id;
END;
$function$;

-- Atualizar a função de chamada de senha para incluir as salas específicas
DROP FUNCTION IF EXISTS public.call_next_ticket(text, uuid);

CREATE FUNCTION public.call_next_ticket(
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
    v_new_status text;
BEGIN
    -- Definir novo status com base na sala
    v_new_status := CASE
        WHEN p_room LIKE 'TRIAGEM%' THEN 'triagem'
        WHEN p_room LIKE 'ATENDIMENTO%' THEN 'em_atendimento'
        ELSE 'em_espera'
    END;

    -- Se houver uma senha atual, marcar como concluída
    IF p_current_ticket_id IS NOT NULL THEN
        UPDATE queue_tickets
        SET status = 'concluido',
            completed_at = NOW()
        WHERE id = p_current_ticket_id;
    END IF;

    -- Buscar próxima senha
    SELECT t.id, t.ticket_number, p.full_name
    INTO v_next_ticket
    FROM queue_tickets t
    JOIN patients p ON p.id = t.patient_id
    WHERE t.status = 'em_espera'
    ORDER BY 
        CASE 
            WHEN t.priority = 'emergency' THEN 1
            WHEN t.priority = 'priority' THEN 2
            ELSE 3
        END,
        t.created_at
    LIMIT 1;

    -- Se encontrou uma senha, atualizar sala e status
    IF v_next_ticket.id IS NOT NULL THEN
        UPDATE queue_tickets
        SET room = p_room,
            status = v_new_status,
            called_at = NOW()
        WHERE id = v_next_ticket.id;

        RETURN QUERY
        SELECT 
            t.id,
            t.ticket_number,
            p.full_name,
            t.room,
            t.status
        FROM queue_tickets t
        JOIN patients p ON p.id = t.patient_id
        WHERE t.id = v_next_ticket.id;
    END IF;
END;
$function$;

-- Atualizar a view do painel de chamadas
DROP VIEW IF EXISTS public.queue_display;

CREATE VIEW public.queue_display AS
SELECT 
    t.id,
    t.ticket_number,
    p.full_name as patient_name,
    t.room,
    t.status,
    t.called_at,
    t.priority
FROM queue_tickets t
JOIN patients p ON p.id = t.patient_id
WHERE t.status IN ('triagem', 'em_atendimento')
AND t.called_at >= (CURRENT_TIMESTAMP - INTERVAL '24 hours');

-- Garantir permissões
GRANT SELECT ON public.queue_display TO anon;
GRANT EXECUTE ON FUNCTION public.call_next_ticket(text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.generate_patient_ticket_and_print(uuid, text) TO anon;

COMMIT; 