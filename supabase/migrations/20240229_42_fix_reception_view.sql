BEGIN;

-- Criar tabela para registrar impressões de formulários se não existir
CREATE TABLE IF NOT EXISTS patient_forms (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
    printed_at timestamp with time zone DEFAULT now(),
    UNIQUE(patient_id)
);

-- Recriar a view da recepção
DROP VIEW IF EXISTS reception_view CASCADE;

CREATE VIEW reception_view AS
SELECT 
    p.id,
    p.full_name,
    p.cpf,
    p.birth_date,
    p.sus_card,
    p.phone,
    p.address,
    p.emergency_contact,
    p.created_at,
    COALESCE(pf.printed_at IS NOT NULL, false) as form_printed,
    pf.printed_at,
    CASE 
        WHEN qt.status IS NULL THEN NULL
        ELSE qt.status::text
    END as ticket_status,
    qt.ticket_number,
    qt.priority
FROM patients p
LEFT JOIN patient_forms pf ON p.id = pf.patient_id
LEFT JOIN queue_tickets qt ON 
    qt.patient_id = p.id AND 
    qt.created_at::date = CURRENT_DATE AND
    qt.status NOT IN ('completed', 'cancelled')
ORDER BY 
    p.created_at DESC;

-- Função para buscar pacientes na recepção
CREATE OR REPLACE FUNCTION search_reception_patients(search_term text)
RETURNS TABLE (
    id uuid,
    full_name text,
    cpf text,
    birth_date date,
    sus_card text,
    phone text,
    form_printed boolean,
    ticket_status text,
    ticket_number text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.cpf,
        p.birth_date,
        p.sus_card,
        p.phone,
        COALESCE(pf.printed_at IS NOT NULL, false) as form_printed,
        qt.status::text as ticket_status,
        qt.ticket_number
    FROM patients p
    LEFT JOIN patient_forms pf ON p.id = pf.patient_id
    LEFT JOIN queue_tickets qt ON 
        qt.patient_id = p.id AND 
        qt.created_at::date = CURRENT_DATE AND
        qt.status NOT IN ('completed', 'cancelled')
    WHERE 
        p.full_name ILIKE '%' || search_term || '%' OR
        p.cpf LIKE '%' || search_term || '%'
    ORDER BY 
        CASE 
            WHEN p.full_name ILIKE search_term || '%' THEN 1
            WHEN p.full_name ILIKE '%' || search_term || '%' THEN 2
            ELSE 3
        END,
        p.created_at DESC;
END;
$$;

-- Função para gerar senha e registrar impressão
CREATE OR REPLACE FUNCTION generate_patient_ticket_and_print(
    p_patient_id uuid,
    p_priority text DEFAULT 'normal'
)
RETURNS TABLE (
    ticket_id uuid,
    ticket_number text,
    patient_name text,
    priority text,
    status text,
    form_printed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_ticket_number text;
    v_patient_name text;
    v_ticket_id uuid;
BEGIN
    -- Verificar se o paciente já tem uma senha ativa
    IF EXISTS (
        SELECT 1 
        FROM queue_tickets 
        WHERE patient_id = p_patient_id 
        AND created_at::date = CURRENT_DATE
        AND status NOT IN ('completed', 'cancelled')
    ) THEN
        RAISE EXCEPTION 'Paciente já possui uma senha ativa hoje';
    END IF;

    -- Buscar nome do paciente
    SELECT full_name INTO v_patient_name
    FROM patients
    WHERE id = p_patient_id;

    -- Gerar número da senha
    SELECT generate_ticket_number('triagem') INTO v_ticket_number;

    -- Criar a senha
    INSERT INTO queue_tickets (
        ticket_number,
        patient_id,
        patient_name,
        service_type,
        priority,
        status,
        current_sector
    )
    VALUES (
        v_ticket_number,
        p_patient_id,
        v_patient_name,
        'triagem',
        p_priority,
        'waiting',
        'triagem'
    )
    RETURNING id INTO v_ticket_id;

    -- Registrar impressão do formulário se ainda não foi impresso
    INSERT INTO patient_forms (patient_id, printed_at)
    SELECT p_patient_id, NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM patient_forms WHERE patient_id = p_patient_id
    );

    -- Retornar dados
    RETURN QUERY
    SELECT 
        v_ticket_id,
        v_ticket_number,
        v_patient_name,
        p_priority,
        'waiting'::text,
        true as form_printed;
END;
$$;

-- Garantir permissões
GRANT SELECT ON reception_view TO anon;
GRANT EXECUTE ON FUNCTION generate_patient_ticket_and_print(uuid, text) TO anon;
GRANT EXECUTE ON FUNCTION search_reception_patients(text) TO anon;
GRANT ALL ON patient_forms TO anon;

COMMIT; 