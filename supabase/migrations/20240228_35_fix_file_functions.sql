-- Função para upload de arquivos em exames
CREATE OR REPLACE FUNCTION upload_exam_files(
    p_exam_id UUID,
    p_files JSONB
) RETURNS void AS $$
BEGIN
    UPDATE exams
    SET 
        files = p_files,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_exam_id
    AND (
        requested_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM auth.users u
            JOIN user_roles ur ON u.id = ur.user_id
            JOIN roles r ON ur.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name IN ('admin', 'doctor', 'nurse')
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para download de arquivos de exames
CREATE OR REPLACE FUNCTION get_exam_files(
    p_exam_id UUID
) RETURNS JSONB AS $$
BEGIN
    RETURN (
        SELECT files
        FROM exams
        WHERE id = p_exam_id
        AND (
            patient_id IN (
                SELECT id FROM patients WHERE id = exams.patient_id
            )
            OR EXISTS (
                SELECT 1 FROM auth.users u
                JOIN user_roles ur ON u.id = ur.user_id
                JOIN roles r ON ur.role_id = r.id
                WHERE u.id = auth.uid()
                AND r.name IN ('admin', 'doctor', 'nurse')
            )
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para upload de arquivos em prontuários
CREATE OR REPLACE FUNCTION upload_record_attachments(
    p_record_id UUID,
    p_attachments JSONB
) RETURNS void AS $$
BEGIN
    UPDATE medical_records
    SET 
        attachments = p_attachments,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_record_id
    AND EXISTS (
        SELECT 1 FROM auth.users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        WHERE u.id = auth.uid()
        AND r.name IN ('admin', 'doctor', 'nurse')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para download de arquivos de prontuários
CREATE OR REPLACE FUNCTION get_record_attachments(
    p_record_id UUID
) RETURNS JSONB AS $$
BEGIN
    RETURN (
        SELECT attachments
        FROM medical_records
        WHERE id = p_record_id
        AND EXISTS (
            SELECT 1 FROM auth.users u
            JOIN user_roles ur ON u.id = ur.user_id
            JOIN roles r ON ur.role_id = r.id
            WHERE u.id = auth.uid()
            AND r.name IN ('admin', 'doctor', 'nurse')
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 