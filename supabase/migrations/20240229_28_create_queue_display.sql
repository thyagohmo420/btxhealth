-- Remover objetos existentes
DROP VIEW IF EXISTS queue_display CASCADE;
DROP VIEW IF EXISTS queue_history CASCADE;
DROP TABLE IF EXISTS queue_tickets CASCADE;

-- Criar enums
DROP TYPE IF EXISTS queue_service_type CASCADE;
DROP TYPE IF EXISTS queue_status CASCADE;

CREATE TYPE queue_service_type AS ENUM (
    'triagem_1',
    'atendimento_1',
    'atendimento_2'
);

CREATE TYPE queue_status AS ENUM (
    'waiting',
    'called',
    'in_service',
    'forwarded',
    'completed',
    'cancelled'
);

-- Criar tabela principal
CREATE TABLE queue_tickets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_number text NOT NULL,
    patient_id uuid REFERENCES patients(id) NOT NULL,
    patient_name text NOT NULL,
    service_type queue_service_type NOT NULL,
    priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'priority', 'emergency')),
    status queue_status NOT NULL DEFAULT 'waiting',
    current_sector text NOT NULL,
    next_sector text,
    called_by uuid REFERENCES auth.users(id),
    called_at timestamptz,
    forwarded_by uuid REFERENCES auth.users(id),
    forwarded_at timestamptz,
    completed_by uuid REFERENCES auth.users(id),
    completed_at timestamptz,
    room text,
    notes text,
    vital_signs jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Criar índices
CREATE INDEX idx_queue_tickets_status ON queue_tickets(status);
CREATE INDEX idx_queue_tickets_current_sector ON queue_tickets(current_sector);
CREATE INDEX idx_queue_tickets_created_at ON queue_tickets(created_at);

-- Habilitar RLS
ALTER TABLE queue_tickets ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Permitir leitura de senhas para todos usuários autenticados"
ON queue_tickets FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir criação de senhas para recepção"
ON queue_tickets FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND role IN ('admin', 'receptionist')
    )
);

CREATE POLICY "Permitir atualização de senhas para equipe médica"
ON queue_tickets FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND role IN ('admin', 'doctor', 'nurse', 'receptionist')
    )
);

-- Criar funções
CREATE OR REPLACE FUNCTION generate_ticket_number(service_type queue_service_type)
RETURNS text AS $$
DECLARE
    prefix text;
    next_number integer;
BEGIN
    prefix := CASE 
        WHEN service_type = 'triagem_1' THEN 'T'
        WHEN service_type = 'atendimento_1' THEN 'A'
        WHEN service_type = 'atendimento_2' THEN 'B'
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

CREATE OR REPLACE FUNCTION call_next_ticket(p_sector text, p_room text)
RETURNS TABLE (
    ticket_id uuid,
    ticket_number text,
    patient_name text,
    service_type queue_service_type,
    priority text,
    room text,
    vital_signs jsonb
) AS $$
BEGIN
    RETURN QUERY
    WITH next_ticket AS (
        UPDATE queue_tickets
        SET 
            status = 'called',
            called_by = auth.uid(),
            called_at = now(),
            room = p_room
        WHERE id = (
            SELECT id
            FROM queue_tickets
            WHERE current_sector = p_sector
            AND status = 'waiting'
            ORDER BY 
                CASE priority
                    WHEN 'emergency' THEN 1
                    WHEN 'priority' THEN 2
                    ELSE 3
                END,
                created_at ASC
            LIMIT 1
        )
        RETURNING id, ticket_number, patient_name, service_type, priority, room, vital_signs
    )
    SELECT * FROM next_ticket;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION forward_patient(
    p_ticket_id uuid,
    p_next_sector text,
    p_vital_signs jsonb DEFAULT NULL,
    p_notes text DEFAULT NULL
) RETURNS void AS $$
DECLARE
    v_next_service_type queue_service_type;
    v_new_ticket_number text;
BEGIN
    v_next_service_type := CASE p_next_sector
        WHEN 'medical_1' THEN 'atendimento_1'::queue_service_type
        WHEN 'medical_2' THEN 'atendimento_2'::queue_service_type
        ELSE NULL
    END;

    IF v_next_service_type IS NOT NULL THEN
        v_new_ticket_number := generate_ticket_number(v_next_service_type);

        INSERT INTO queue_tickets (
            ticket_number,
            patient_id,
            patient_name,
            service_type,
            priority,
            status,
            current_sector,
            vital_signs,
            notes,
            created_by
        )
        SELECT 
            v_new_ticket_number,
            patient_id,
            patient_name,
            v_next_service_type,
            priority,
            'waiting',
            p_next_sector,
            COALESCE(p_vital_signs, vital_signs),
            CASE 
                WHEN p_notes IS NULL THEN notes
                WHEN notes IS NULL THEN p_notes
                ELSE notes || E'\n' || p_notes
            END,
            auth.uid()
        FROM queue_tickets
        WHERE id = p_ticket_id;

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

CREATE OR REPLACE FUNCTION complete_service(
    p_ticket_id uuid,
    p_notes text DEFAULT NULL
) RETURNS void AS $$
BEGIN
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
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_old_tickets()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE queue_tickets
    SET status = 'cancelled'
    WHERE status IN ('waiting', 'called')
        AND created_at < CURRENT_DATE;
    
    RETURN NULL;
END;
$$;

-- Criar trigger
CREATE TRIGGER update_old_tickets_trigger
AFTER INSERT ON queue_tickets
EXECUTE FUNCTION update_old_tickets();

-- Criar views em uma transação separada
DO $$ 
BEGIN
    -- Verificar se a tabela existe e tem todas as colunas necessárias
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'queue_tickets'
    ) THEN
        -- Criar view queue_display
        EXECUTE 'CREATE OR REPLACE VIEW queue_display AS
        SELECT 
            qt.id,
            qt.ticket_number,
            qt.patient_name,
            qt.service_type,
            qt.priority,
            qt.status,
            qt.current_sector,
            qt.next_sector,
            qt.room,
            qt.called_at,
            qt.vital_signs,
            qt.notes,
            qt.created_at,
            qt.created_by,
            qt.called_by,
            qt.forwarded_by,
            qt.completed_by,
            u.username as called_by_name,
            c.username as created_by_name
        FROM queue_tickets qt
        LEFT JOIN users u ON qt.called_by = u.id
        LEFT JOIN users c ON qt.created_by = c.id
        WHERE qt.status IN (''waiting'', ''called'', ''in_service'')
        ORDER BY 
            CASE qt.status
                WHEN ''called'' THEN 1
                WHEN ''in_service'' THEN 2
                WHEN ''waiting'' THEN 3
            END,
            CASE qt.priority
                WHEN ''emergency'' THEN 1
                WHEN ''priority'' THEN 2
                ELSE 3
            END,
            qt.created_at ASC';

        -- Criar view queue_history
        EXECUTE 'CREATE OR REPLACE VIEW queue_history AS
        SELECT 
            qt.id,
            qt.ticket_number,
            qt.patient_id,
            qt.patient_name,
            qt.service_type,
            qt.priority,
            qt.status,
            qt.current_sector,
            qt.next_sector,
            qt.called_by,
            qt.called_at,
            qt.forwarded_by,
            qt.forwarded_at,
            qt.completed_by,
            qt.completed_at,
            qt.room,
            qt.notes,
            qt.vital_signs,
            qt.created_by,
            qt.created_at,
            qt.updated_at,
            c.username as created_by_name,
            cb.username as called_by_name,
            fb.username as forwarded_by_name,
            cpb.username as completed_by_name
        FROM queue_tickets qt
        LEFT JOIN users c ON qt.created_by = c.id
        LEFT JOIN users cb ON qt.called_by = cb.id
        LEFT JOIN users fb ON qt.forwarded_by = fb.id
        LEFT JOIN users cpb ON qt.completed_by = cpb.id
        WHERE qt.status = ''completed''
        ORDER BY qt.completed_at DESC';
    END IF;
END $$; 