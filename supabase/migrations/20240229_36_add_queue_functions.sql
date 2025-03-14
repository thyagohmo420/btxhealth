-- Remover função antiga primeiro
DROP FUNCTION IF EXISTS generate_ticket_number(text);

-- Função para gerar número da senha
CREATE OR REPLACE FUNCTION generate_ticket_number(service_type text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    prefix text;
    next_number integer;
    result text;
BEGIN
    -- Definir prefixo baseado no tipo de serviço
    prefix := CASE 
        WHEN service_type = 'triagem' THEN 'T'
        ELSE 'A'
    END;

    -- Buscar o último número usado hoje
    SELECT COALESCE(MAX(NULLIF(regexp_replace(ticket_number, '[^0-9]', '', 'g'), '')::integer), 0)
    INTO next_number
    FROM queue_tickets
    WHERE DATE(created_at) = CURRENT_DATE
    AND ticket_number LIKE prefix || '%';

    -- Incrementar o número
    next_number := next_number + 1;

    -- Formatar o resultado (exemplo: T001, A002)
    result := prefix || LPAD(next_number::text, 3, '0');

    RETURN result;
END;
$$;

-- Função para chamar a próxima senha
CREATE OR REPLACE FUNCTION call_next_ticket(p_sector text, p_room text DEFAULT NULL)
RETURNS TABLE (
    ticket_id uuid,
    ticket_number text,
    patient_name text,
    priority text,
    status text
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH next_ticket AS (
        UPDATE queue_tickets
        SET 
            status = 'called',
            current_sector = p_sector,
            room = p_room,
            called_at = NOW()
        WHERE id = (
            SELECT id
            FROM queue_tickets
            WHERE status = 'waiting'
            AND (
                CASE 
                    WHEN p_sector = 'triagem' THEN service_type = 'triagem'
                    ELSE service_type = 'atendimento'
                END
            )
            ORDER BY 
                CASE priority
                    WHEN 'emergency' THEN 1
                    WHEN 'urgent' THEN 2
                    ELSE 3
                END,
                created_at ASC
            LIMIT 1
        )
        RETURNING id, ticket_number, patient_name, priority, status::text
    )
    SELECT * FROM next_ticket;
END;
$$;

-- Função para encaminhar paciente
CREATE OR REPLACE FUNCTION forward_patient(
    p_ticket_id uuid,
    p_target_sector text,
    p_room text DEFAULT NULL
)
RETURNS TABLE (
    new_ticket_id uuid,
    ticket_number text,
    patient_name text,
    status text
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_patient_id uuid;
    v_patient_name text;
    v_priority text;
BEGIN
    -- Marcar a senha atual como encaminhada
    UPDATE queue_tickets
    SET 
        status = 'forwarded',
        forwarded_at = NOW(),
        forwarded_to = p_target_sector
    WHERE id = p_ticket_id
    RETURNING patient_id, patient_name, priority
    INTO v_patient_id, v_patient_name, v_priority;

    -- Criar nova senha para o setor de destino
    RETURN QUERY
    WITH new_ticket AS (
        INSERT INTO queue_tickets (
            ticket_number,
            patient_id,
            patient_name,
            service_type,
            priority,
            status,
            current_sector,
            room,
            forwarded_from
        )
        VALUES (
            generate_ticket_number('atendimento'),
            v_patient_id,
            v_patient_name,
            'atendimento',
            v_priority,
            'waiting',
            p_target_sector,
            p_room,
            p_ticket_id
        )
        RETURNING id, ticket_number, patient_name, status::text
    )
    SELECT * FROM new_ticket;
END;
$$;

-- Função para completar atendimento
CREATE OR REPLACE FUNCTION complete_ticket(p_ticket_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE queue_tickets
    SET 
        status = 'completed',
        completed_at = NOW()
    WHERE id = p_ticket_id;
END;
$$;

-- Função para cancelar senha
CREATE OR REPLACE FUNCTION cancel_ticket(p_ticket_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE queue_tickets
    SET 
        status = 'cancelled',
        cancelled_at = NOW()
    WHERE id = p_ticket_id;
END;
$$; 