-- Função para criar ou atualizar triagem
CREATE OR REPLACE FUNCTION upsert_triage(
    p_patient_id UUID,
    p_professional_id UUID,
    p_vital_signs JSONB,
    p_symptoms TEXT[],
    p_notes TEXT,
    p_status TEXT DEFAULT 'waiting',
    p_priority TEXT DEFAULT 'normal'
) RETURNS JSONB AS $$
DECLARE
    v_triage_id UUID;
    v_old_data JSONB;
    v_new_data JSONB;
BEGIN
    -- Validar dados obrigatórios
    IF p_patient_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'ID do paciente é obrigatório'
        );
    END IF;

    IF p_professional_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'ID do profissional é obrigatório'
        );
    END IF;

    -- Verificar permissões
    IF NOT EXISTS (
        SELECT 1
        FROM auth.users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        WHERE u.id = auth.uid()
        AND r.name IN ('admin', 'nurse')
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Usuário não tem permissão'
        );
    END IF;

    -- Verificar se já existe triagem para o paciente hoje
    SELECT id, jsonb_build_object(
        'vital_signs', vital_signs,
        'symptoms', symptoms,
        'notes', notes,
        'status', status,
        'priority', priority
    )
    INTO v_triage_id, v_old_data
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
        WHERE id = v_triage_id
        RETURNING jsonb_build_object(
            'vital_signs', vital_signs,
            'symptoms', symptoms,
            'notes', notes,
            'status', status,
            'priority', priority
        ) INTO v_new_data;

        -- Atualizar status do paciente
        UPDATE patients
        SET 
            status = p_status,
            priority = p_priority,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = p_patient_id;

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
        ) 
        RETURNING 
            id,
            jsonb_build_object(
                'vital_signs', vital_signs,
                'symptoms', symptoms,
                'notes', notes,
                'status', status,
                'priority', priority
            )
        INTO v_triage_id, v_new_data;

        -- Atualizar status do paciente
        UPDATE patients
        SET 
            status = p_status,
            priority = p_priority,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = p_patient_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'triage_id', v_triage_id,
        'old_data', v_old_data,
        'new_data', v_new_data
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 