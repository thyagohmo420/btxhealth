-- Criar tabela de logs
CREATE TABLE IF NOT EXISTS triage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    patient_id UUID,
    triage_id UUID,
    old_data JSONB,
    new_data JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Função para registrar log
CREATE OR REPLACE FUNCTION log_triage_action(
    p_action TEXT,
    p_patient_id UUID,
    p_triage_id UUID DEFAULT NULL,
    p_old_data JSONB DEFAULT NULL,
    p_new_data JSONB DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO triage_logs (
        action,
        user_id,
        patient_id,
        triage_id,
        old_data,
        new_data,
        error_message
    ) VALUES (
        p_action,
        auth.uid(),
        p_patient_id,
        p_triage_id,
        p_old_data,
        p_new_data,
        p_error_message
    ) RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função melhorada para atualizar status do paciente
CREATE OR REPLACE FUNCTION update_patient_status(
    p_patient_id UUID,
    p_status TEXT,
    p_priority TEXT
) RETURNS JSONB AS $$
DECLARE
    v_old_data JSONB;
    v_new_data JSONB;
    v_log_id UUID;
BEGIN
    -- Verificar se o paciente existe
    IF NOT EXISTS (SELECT 1 FROM patients WHERE id = p_patient_id) THEN
        PERFORM log_triage_action(
            'update_status_error',
            p_patient_id,
            NULL,
            NULL,
            NULL,
            'Paciente não encontrado'
        );
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Paciente não encontrado'
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
        PERFORM log_triage_action(
            'update_status_error',
            p_patient_id,
            NULL,
            NULL,
            NULL,
            'Usuário não tem permissão'
        );
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Usuário não tem permissão'
        );
    END IF;

    -- Obter dados antigos
    SELECT jsonb_build_object(
        'status', status,
        'priority', priority
    )
    INTO v_old_data
    FROM patients
    WHERE id = p_patient_id;

    -- Validar status
    IF p_status IS NULL OR p_status NOT IN ('waiting', 'in_progress', 'completed', 'cancelled') THEN
        PERFORM log_triage_action(
            'update_status_error',
            p_patient_id,
            NULL,
            v_old_data,
            NULL,
            'Status inválido: ' || COALESCE(p_status::text, 'NULL')
        );
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Status inválido'
        );
    END IF;

    -- Validar prioridade
    IF p_priority IS NULL OR p_priority NOT IN ('emergency', 'urgent', 'high', 'normal', 'low') THEN
        PERFORM log_triage_action(
            'update_status_error',
            p_patient_id,
            NULL,
            v_old_data,
            NULL,
            'Prioridade inválida: ' || COALESCE(p_priority::text, 'NULL')
        );
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Prioridade inválida'
        );
    END IF;

    -- Atualizar status e prioridade do paciente
    UPDATE patients
    SET 
        status = p_status,
        priority = p_priority,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_patient_id;

    -- Obter dados novos
    SELECT jsonb_build_object(
        'status', status,
        'priority', priority
    )
    INTO v_new_data
    FROM patients
    WHERE id = p_patient_id;

    -- Registrar log de sucesso
    PERFORM log_triage_action(
        'update_status_success',
        p_patient_id,
        NULL,
        v_old_data,
        v_new_data
    );

    RETURN jsonb_build_object(
        'success', true,
        'old_data', v_old_data,
        'new_data', v_new_data
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função melhorada para criar ou atualizar triagem
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
    v_update_result JSONB;
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

        -- Registrar log de atualização
        PERFORM log_triage_action(
            'update_triage',
            p_patient_id,
            v_triage_id,
            v_old_data,
            v_new_data
        );
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

        -- Registrar log de criação
        PERFORM log_triage_action(
            'create_triage',
            p_patient_id,
            v_triage_id,
            NULL,
            v_new_data
        );
    END IF;

    -- Atualizar status do paciente
    v_update_result := update_patient_status(p_patient_id, p_status, p_priority);

    RETURN jsonb_build_object(
        'success', true,
        'triage_id', v_triage_id,
        'old_data', v_old_data,
        'new_data', v_new_data,
        'patient_update', v_update_result
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 