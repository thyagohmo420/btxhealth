BEGIN;

-- Dropar a função existente primeiro
DROP FUNCTION IF EXISTS public.generate_patient_ticket_and_print(uuid, text);

-- Função para gerar senha e registrar impressão
CREATE OR REPLACE FUNCTION public.generate_patient_ticket_and_print(
    p_patient_id uuid,
    p_priority text DEFAULT 'normal'
) RETURNS jsonb AS $$
DECLARE
    v_ticket_number text;
    v_result jsonb;
BEGIN
    -- Verificar se já existe um ticket ativo para o paciente hoje
    IF EXISTS (
        SELECT 1 
        FROM queue_tickets 
        WHERE patient_id = p_patient_id 
        AND DATE(created_at) = CURRENT_DATE
        AND status NOT IN ('finalizado', 'cancelado')
    ) THEN
        RAISE EXCEPTION 'Paciente já possui uma senha ativa hoje';
    END IF;

    -- Gerar número da senha
    WITH new_number AS (
        SELECT COUNT(*) + 1 as num
        FROM queue_tickets
        WHERE DATE(created_at) = CURRENT_DATE
        AND priority = p_priority
    )
    SELECT 
        CASE p_priority
            WHEN 'emergency' THEN 'E'
            WHEN 'priority' THEN 'P'
            ELSE 'N'
        END || 
        TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || 
        LPAD(num::text, 3, '0')
    INTO v_ticket_number
    FROM new_number;

    -- Inserir o ticket
    INSERT INTO queue_tickets (
        patient_id,
        ticket_number,
        patient_name,
        status,
        priority,
        created_at
    )
    SELECT
        p_patient_id,
        v_ticket_number,
        p.full_name,
        'em_espera'::queue_status,
        p_priority,
        NOW()
    FROM patients p
    WHERE p.id = p_patient_id
    RETURNING jsonb_build_object(
        'id', id,
        'ticket_number', ticket_number,
        'patient_name', patient_name,
        'status', status,
        'priority', priority,
        'created_at', created_at
    ) INTO v_result;

    -- Registrar a impressão do formulário se ainda não foi registrada
    INSERT INTO patient_forms (patient_id, printed_at)
    SELECT p_patient_id, NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM patient_forms 
        WHERE patient_id = p_patient_id
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir permissões
GRANT EXECUTE ON FUNCTION public.generate_patient_ticket_and_print(uuid, text) TO anon;

COMMIT; 