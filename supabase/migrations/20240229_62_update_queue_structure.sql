-- Atualizar os tipos enum
DROP TYPE IF EXISTS queue_status CASCADE;
CREATE TYPE queue_status AS ENUM ('aguardando', 'triagem', 'em_atendimento', 'concluido');

DROP TYPE IF EXISTS ticket_priority CASCADE;
CREATE TYPE ticket_priority AS ENUM ('normal', 'priority', 'emergency');

-- Atualizar a tabela queue_tickets
ALTER TABLE queue_tickets 
DROP COLUMN IF EXISTS patient_name;

-- Função para gerar senha
CREATE OR REPLACE FUNCTION generate_ticket(
    p_patient_id uuid,
    p_priority text DEFAULT 'normal',
    p_setor text DEFAULT 'TRIAGEM'
)
RETURNS TABLE (
    ticket_id uuid,
    ticket_number text,
    patient_name text,
    priority text,
    status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_last_number integer;
    v_new_ticket record;
BEGIN
    -- Buscar último número do dia
    SELECT COALESCE(MAX(SUBSTRING(ticket_number FROM '\d+')::integer), 0)
    INTO v_last_number
    FROM queue_tickets
    WHERE created_at::date = CURRENT_DATE;

    -- Inserir nova senha
    WITH new_ticket AS (
        INSERT INTO queue_tickets (
            patient_id,
            ticket_number,
            priority,
            status,
            room,
            created_at
        )
        VALUES (
            p_patient_id,
            CASE p_priority
                WHEN 'emergency' THEN 'E'
                WHEN 'priority' THEN 'P'
                ELSE 'N'
            END || LPAD((v_last_number + 1)::text, 3, '0'),
            p_priority::ticket_priority,
            'aguardando'::queue_status,
            p_setor,
            NOW()
        )
        RETURNING *
    )
    SELECT 
        nt.id,
        nt.ticket_number,
        p.full_name,
        nt.priority::text,
        nt.status::text
    INTO v_new_ticket
    FROM new_ticket nt
    JOIN patients p ON p.id = nt.patient_id;

    RETURN QUERY
    SELECT 
        v_new_ticket.id,
        v_new_ticket.ticket_number,
        v_new_ticket.full_name,
        v_new_ticket.priority,
        v_new_ticket.status;
END;
$$;

-- Função para chamar próxima senha
CREATE OR REPLACE FUNCTION call_next_ticket(p_room text)
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
    -- Buscar e atualizar próximo ticket
    WITH next_ticket AS (
        UPDATE queue_tickets qt
        SET 
            status = CASE 
                WHEN p_room LIKE 'TRIAGEM%' THEN 'triagem'
                ELSE 'em_atendimento'
            END::queue_status,
            room = p_room,
            called_at = NOW()
        WHERE qt.id = (
            SELECT qt2.id
            FROM queue_tickets qt2
            WHERE qt2.created_at::date = CURRENT_DATE
            AND qt2.status = 'aguardando'
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

-- Atualizar a view queue_display
CREATE OR REPLACE VIEW queue_display AS
SELECT 
    qt.id,
    qt.ticket_number,
    p.full_name as patient_name,
    qt.room,
    CASE 
        WHEN qt.room LIKE 'TRIAGEM%' THEN 'Triagem'
        WHEN qt.room LIKE 'CONSULTORIO%' THEN 'Consultório'
        ELSE qt.room
    END AS room_display,
    qt.status,
    CASE 
        WHEN qt.status = 'aguardando' THEN 'Aguardando'
        WHEN qt.status = 'triagem' THEN 'Em Triagem'
        WHEN qt.status = 'em_atendimento' THEN 'Em Atendimento'
        WHEN qt.status = 'concluido' THEN 'Concluído'
    END AS status_display,
    qt.priority,
    qt.called_at,
    qt.created_at
FROM queue_tickets qt
JOIN patients p ON p.id = qt.patient_id
WHERE qt.created_at::date = CURRENT_DATE
ORDER BY 
    CASE qt.priority
        WHEN 'emergency' THEN 1
        WHEN 'priority' THEN 2
        ELSE 3
    END,
    qt.created_at;

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_ticket(uuid, text, text) TO anon;
GRANT EXECUTE ON FUNCTION call_next_ticket(text) TO anon;

COMMIT; 