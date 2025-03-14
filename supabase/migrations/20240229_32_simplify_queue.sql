-- Simplificar os tipos de serviço
DROP TYPE IF EXISTS queue_service_type CASCADE;
CREATE TYPE queue_service_type AS ENUM (
    'triagem',      -- Triagem inicial
    'atendimento'   -- Atendimento médico
);

-- Simplificar os setores e adicionar tipo de serviço
ALTER TABLE queue_tickets
    ADD COLUMN IF NOT EXISTS service_type queue_service_type NOT NULL DEFAULT 'triagem',
    ALTER COLUMN current_sector TYPE text,
    ALTER COLUMN current_sector SET DEFAULT 'triagem',
    ADD CONSTRAINT valid_sector CHECK (
        current_sector IN ('triagem', 'consultorio_1', 'consultorio_2')
    );

-- Atualizar as views
CREATE OR REPLACE VIEW queue_display AS
SELECT 
    qt.id,
    qt.ticket_number,
    qt.patient_name,
    qt.service_type,
    qt.priority,
    qt.status,
    qt.current_sector,
    CASE qt.current_sector
        WHEN 'triagem' THEN 'Triagem'
        WHEN 'consultorio_1' THEN 'Consultório 1'
        WHEN 'consultorio_2' THEN 'Consultório 2'
    END as sector_name,
    qt.room,
    qt.called_at,
    qt.vital_signs,
    qt.notes,
    qt.created_at,
    qt.called_by,
    qt.forwarded_by,
    qt.completed_by,
    (u.raw_user_meta_data->>'name')::varchar(255) as called_by_name
FROM queue_tickets qt
LEFT JOIN auth.users u ON qt.called_by = u.id
WHERE qt.status IN ('waiting', 'called', 'in_service')
ORDER BY 
    CASE qt.status
        WHEN 'called' THEN 1
        WHEN 'in_service' THEN 2
        WHEN 'waiting' THEN 3
    END,
    CASE qt.priority
        WHEN 'emergency' THEN 1
        WHEN 'priority' THEN 2
        ELSE 3
    END,
    qt.created_at ASC;

CREATE OR REPLACE VIEW queue_history AS
SELECT 
    qt.id,
    qt.ticket_number,
    qt.patient_id,
    qt.patient_name,
    qt.service_type,
    qt.priority,
    qt.status,
    qt.current_sector,
    CASE qt.current_sector
        WHEN 'triagem' THEN 'Triagem'
        WHEN 'consultorio_1' THEN 'Consultório 1'
        WHEN 'consultorio_2' THEN 'Consultório 2'
    END as sector_name,
    qt.called_by,
    qt.called_at,
    qt.forwarded_by,
    qt.forwarded_at,
    qt.completed_by,
    qt.completed_at,
    qt.room,
    qt.notes,
    qt.vital_signs,
    qt.created_at,
    qt.updated_at,
    (cb.raw_user_meta_data->>'name')::varchar(255) as called_by_name,
    (fb.raw_user_meta_data->>'name')::varchar(255) as forwarded_by_name,
    (cpb.raw_user_meta_data->>'name')::varchar(255) as completed_by_name
FROM queue_tickets qt
LEFT JOIN auth.users cb ON qt.called_by = cb.id
LEFT JOIN auth.users fb ON qt.forwarded_by = fb.id
LEFT JOIN auth.users cpb ON qt.completed_by = cpb.id
WHERE qt.status = 'completed'
ORDER BY qt.completed_at DESC;

-- Atualizar a função de geração de senhas
CREATE OR REPLACE FUNCTION generate_ticket_number(service_type queue_service_type)
RETURNS text AS $$
DECLARE
    prefix text;
    next_number integer;
BEGIN
    prefix := CASE 
        WHEN service_type = 'triagem' THEN 'T'
        WHEN service_type = 'atendimento' THEN 'A'
        ELSE 'X'
    END;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 2) AS integer)), 0) + 1
    INTO next_number
    FROM queue_tickets
    WHERE ticket_number LIKE prefix || '%'
    AND DATE(created_at) = CURRENT_DATE;
    
    RETURN prefix || LPAD(next_number::text, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Atualizar a função de encaminhamento
CREATE OR REPLACE FUNCTION forward_patient(
    p_ticket_id uuid,
    p_next_sector text,
    p_vital_signs jsonb DEFAULT NULL,
    p_notes text DEFAULT NULL
) RETURNS void AS $$
BEGIN
    -- Se estiver encaminhando para consultório, criar nova senha
    IF p_next_sector IN ('consultorio_1', 'consultorio_2') THEN
        INSERT INTO queue_tickets (
            ticket_number,
            patient_id,
            patient_name,
            service_type,
            priority,
            status,
            current_sector,
            vital_signs,
            notes
        )
        SELECT 
            generate_ticket_number('atendimento'),
            patient_id,
            patient_name,
            'atendimento',
            priority,
            'waiting',
            p_next_sector,
            COALESCE(p_vital_signs, vital_signs),
            CASE 
                WHEN p_notes IS NULL THEN notes
                WHEN notes IS NULL THEN p_notes
                ELSE notes || E'\n' || p_notes
            END
        FROM queue_tickets
        WHERE id = p_ticket_id;

        -- Marcar a senha original como concluída
        UPDATE queue_tickets
        SET 
            status = 'completed',
            completed_by = auth.uid(),
            completed_at = now(),
            notes = CASE 
                WHEN p_notes IS NULL THEN notes
                WHEN notes IS NULL THEN p_notes
                ELSE notes || E'\n' || p_notes
            END
        WHERE id = p_ticket_id;
    ELSE
        -- Apenas atualizar o setor atual
        UPDATE queue_tickets
        SET 
            status = 'forwarded',
            current_sector = p_next_sector,
            forwarded_by = auth.uid(),
            forwarded_at = now(),
            vital_signs = COALESCE(p_vital_signs, vital_signs),
            notes = CASE 
                WHEN p_notes IS NULL THEN notes
                WHEN notes IS NULL THEN p_notes
                ELSE notes || E'\n' || p_notes
            END
        WHERE id = p_ticket_id;
    END IF;
END;
$$ LANGUAGE plpgsql; 