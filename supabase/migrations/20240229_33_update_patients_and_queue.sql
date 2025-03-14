-- Função para gerar senha para um paciente
CREATE OR REPLACE FUNCTION generate_patient_ticket(
    p_patient_id uuid,
    p_priority text DEFAULT 'normal'
) RETURNS uuid AS $$
DECLARE
    v_ticket_id uuid;
BEGIN
    INSERT INTO queue_tickets (
        ticket_number,
        patient_id,
        patient_name,
        service_type,
        priority,
        status,
        current_sector
    )
    SELECT 
        generate_ticket_number('triagem'),
        p.id,
        p.full_name,
        'triagem',
        p_priority,
        'waiting',
        'triagem'
    FROM patients p
    WHERE p.id = p_patient_id
    RETURNING id INTO v_ticket_id;

    RETURN v_ticket_id;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar pacientes para gerar senha
CREATE OR REPLACE FUNCTION search_patients_for_ticket(search_term text)
RETURNS TABLE (
    id uuid,
    full_name text,
    birth_date date,
    cpf text,
    phone text,
    has_active_ticket boolean
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.birth_date,
        p.cpf,
        p.phone,
        EXISTS (
            SELECT 1 
            FROM queue_tickets qt 
            WHERE qt.patient_id = p.id 
            AND qt.status IN ('waiting', 'called', 'in_service')
        ) as has_active_ticket
    FROM patients p
    WHERE 
        p.full_name ILIKE '%' || search_term || '%'
        OR p.cpf LIKE '%' || search_term || '%'
    ORDER BY 
        p.full_name;
END;
$$ LANGUAGE plpgsql;

-- Atualizar a view de pacientes para campos simplificados
CREATE OR REPLACE VIEW patient_details AS 
SELECT 
    p.id,
    p.full_name,
    p.birth_date,
    p.gender,
    p.cpf,
    p.rg,
    p.sus_card,
    p.phone,
    p.address,
    p.emergency_contact,
    p.created_at,
    p.updated_at,
    (
        SELECT COUNT(*)
        FROM queue_tickets qt
        WHERE qt.patient_id = p.id
    ) as total_visits,
    (
        SELECT qt.status
        FROM queue_tickets qt
        WHERE qt.patient_id = p.id
        AND qt.status IN ('waiting', 'called', 'in_service')
        LIMIT 1
    ) as current_ticket_status
FROM patients p; 