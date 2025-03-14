-- Remover funções existentes
DROP FUNCTION IF EXISTS generate_ticket(uuid, text);
DROP FUNCTION IF EXISTS call_next_ticket(text);

-- Atualizar a função generate_ticket para usar o novo status
CREATE OR REPLACE FUNCTION generate_ticket(
    p_patient_id uuid,
    p_priority text DEFAULT 'normal'
) RETURNS json AS $$
DECLARE
    v_ticket_number integer;
    v_ticket_id uuid;
BEGIN
    -- Verificar se já existe uma senha ativa para o paciente
    IF EXISTS (
        SELECT 1 
        FROM queue_tickets 
        WHERE patient_id = p_patient_id 
        AND created_at::date = CURRENT_DATE
        AND status != 'concluido'
    ) THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Paciente já possui uma senha ativa hoje'
        );
    END IF;

    -- Gerar número sequencial para o dia
    SELECT COALESCE(MAX(ticket_number), 0) + 1
    INTO v_ticket_number
    FROM queue_tickets
    WHERE created_at::date = CURRENT_DATE;

    -- Inserir nova senha
    INSERT INTO queue_tickets (
        patient_id,
        ticket_number,
        priority,
        status
    ) VALUES (
        p_patient_id,
        v_ticket_number,
        p_priority,
        'em_espera'
    )
    RETURNING id INTO v_ticket_id;

    RETURN json_build_object(
        'success', true,
        'ticket_id', v_ticket_id,
        'ticket_number', v_ticket_number
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar a função call_next_ticket para usar os novos status
CREATE OR REPLACE FUNCTION call_next_ticket(
    p_room text
) RETURNS json AS $$
DECLARE
    v_ticket_id uuid;
    v_ticket_number integer;
    v_patient_name text;
BEGIN
    -- Selecionar próxima senha aguardando
    SELECT 
        qt.id,
        qt.ticket_number,
        p.full_name
    INTO 
        v_ticket_id,
        v_ticket_number,
        v_patient_name
    FROM queue_tickets qt
    JOIN patients p ON p.id = qt.patient_id
    WHERE qt.status = 'em_espera'
    AND qt.created_at::date = CURRENT_DATE
    ORDER BY 
        CASE qt.priority
            WHEN 'emergency' THEN 1
            WHEN 'priority' THEN 2
            ELSE 3
        END,
        qt.created_at
    LIMIT 1;

    -- Se não encontrou senha aguardando
    IF v_ticket_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Nenhuma senha aguardando'
        );
    END IF;

    -- Atualizar status e sala da senha
    UPDATE queue_tickets
    SET 
        status = CASE 
            WHEN p_room LIKE 'TRIAGEM%' THEN 'em_triagem'
            ELSE 'em_atendimento'
        END,
        room = p_room,
        called_at = NOW()
    WHERE id = v_ticket_id;

    RETURN json_build_object(
        'success', true,
        'ticket_id', v_ticket_id,
        'ticket_number', v_ticket_number,
        'patient_name', v_patient_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir permissões para usuários anônimos
GRANT EXECUTE ON FUNCTION generate_ticket(uuid, text) TO anon;
GRANT EXECUTE ON FUNCTION call_next_ticket(text) TO anon;

COMMIT; 