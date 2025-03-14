BEGIN;

-- Garantir permissões necessárias
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON TABLE public.users TO anon;
GRANT SELECT ON TABLE public.patients TO anon;
GRANT SELECT ON TABLE public.queue_tickets TO anon;

-- Dropar a função existente primeiro
DROP FUNCTION IF EXISTS public.generate_patient_ticket(uuid, text);

-- Recriar a função generate_patient_ticket
CREATE OR REPLACE FUNCTION public.generate_patient_ticket(
    p_patient_id uuid,
    p_priority text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_ticket_number text;
    v_patient_name text;
    v_result jsonb;
BEGIN
    -- Obter o nome do paciente
    SELECT full_name INTO v_patient_name
    FROM public.patients
    WHERE id = p_patient_id;

    IF v_patient_name IS NULL THEN
        RAISE EXCEPTION 'Paciente não encontrado';
    END IF;

    -- Gerar o número do ticket
    SELECT CONCAT(
        UPPER(LEFT(p_priority, 1)),
        LPAD(CAST(COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 2) AS INTEGER)), 0) + 1 AS TEXT), 3, '0')
    ) INTO v_ticket_number
    FROM public.queue_tickets
    WHERE DATE(created_at) = CURRENT_DATE
    AND LEFT(ticket_number, 1) = UPPER(LEFT(p_priority, 1));

    -- Inserir o novo ticket
    INSERT INTO public.queue_tickets (
        patient_id,
        patient_name,
        priority,
        status,
        ticket_number
    )
    VALUES (
        p_patient_id,
        v_patient_name,
        p_priority,
        'em_espera'::queue_status,
        v_ticket_number
    )
    RETURNING jsonb_build_object(
        'ticket_number', ticket_number,
        'status', status,
        'priority', priority,
        'patient_id', patient_id,
        'patient_name', patient_name,
        'created_at', created_at
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- Garantir permissão de execução para a nova função
GRANT EXECUTE ON FUNCTION public.generate_patient_ticket(uuid, text) TO anon;

COMMIT; 