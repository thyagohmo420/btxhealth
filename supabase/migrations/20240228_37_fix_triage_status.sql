-- Remover trigger anterior
DROP TRIGGER IF EXISTS update_patient_status_trigger ON triage;
DROP FUNCTION IF EXISTS update_patient_status();

-- Criar nova função para atualizar status do paciente
CREATE OR REPLACE FUNCTION update_patient_status(
    p_patient_id UUID,
    p_status TEXT,
    p_priority TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar permissões
    IF NOT EXISTS (
        SELECT 1
        FROM auth.users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        WHERE u.id = auth.uid()
        AND r.name IN ('admin', 'nurse')
    ) THEN
        RAISE EXCEPTION 'Usuário não tem permissão para atualizar status do paciente';
    END IF;

    -- Atualizar status e prioridade do paciente
    UPDATE patients
    SET 
        status = p_status,
        priority = p_priority,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_patient_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar função para criar ou atualizar triagem
CREATE OR REPLACE FUNCTION upsert_triage(
    p_patient_id UUID,
    p_professional_id UUID,
    p_vital_signs JSONB,
    p_symptoms TEXT[],
    p_notes TEXT,
    p_status TEXT DEFAULT 'waiting',
    p_priority TEXT DEFAULT 'normal'
) RETURNS UUID AS $$
DECLARE
    v_triage_id UUID;
BEGIN
    -- Verificar permissões
    IF NOT EXISTS (
        SELECT 1
        FROM auth.users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        WHERE u.id = auth.uid()
        AND r.name IN ('admin', 'nurse')
    ) THEN
        RAISE EXCEPTION 'Usuário não tem permissão para criar/atualizar triagem';
    END IF;

    -- Verificar se já existe triagem para o paciente hoje
    SELECT id INTO v_triage_id
    FROM triage
    WHERE patient_id = p_patient_id
    AND DATE(created_at) = CURRENT_DATE
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_triage_id IS NOT NULL THEN
        -- Atualizar triagem existente
        UPDATE triage
        SET 
            vital_signs = p_vital_signs,
            symptoms = p_symptoms,
            notes = p_notes,
            status = p_status,
            priority = p_priority,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_triage_id;
    ELSE
        -- Inserir nova triagem
        INSERT INTO triage (
            patient_id,
            professional_id,
            vital_signs,
            symptoms,
            notes,
            status,
            priority
        ) VALUES (
            p_patient_id,
            p_professional_id,
            p_vital_signs,
            p_symptoms,
            p_notes,
            p_status,
            p_priority
        ) RETURNING id INTO v_triage_id;
    END IF;

    -- Atualizar status do paciente
    PERFORM update_patient_status(p_patient_id, p_status, p_priority);

    RETURN v_triage_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar a view de triagem para incluir dados do paciente
DROP VIEW IF EXISTS triage_view CASCADE;
CREATE VIEW triage_view AS
SELECT 
    t.*,
    p.full_name as patient_name,
    p.cpf,
    p.sus_card,
    p.birth_date,
    p.gender,
    p.blood_type,
    p.allergies,
    p.chronic_conditions,
    p.status as patient_status,
    p.priority as patient_priority,
    prof.full_name as professional_name,
    prof.specialty as professional_specialty
FROM triage t
JOIN patients p ON t.patient_id = p.id
LEFT JOIN professionals prof ON t.professional_id = prof.id
ORDER BY t.created_at DESC; 