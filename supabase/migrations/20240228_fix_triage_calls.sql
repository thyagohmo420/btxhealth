-- Função para criar chamada após triagem
CREATE OR REPLACE FUNCTION create_call_after_triage()
RETURNS TRIGGER AS $$
DECLARE
    patient_name TEXT;
    sector_name TEXT;
BEGIN
    -- Buscar nome do paciente
    SELECT COALESCE(full_name, 'Paciente sem nome') INTO patient_name
    FROM patients
    WHERE id = NEW.patient_id;

    -- Buscar nome do setor baseado na prioridade
    SELECT name INTO sector_name
    FROM sectors
    WHERE type = CASE 
        WHEN NEW.priority = 'emergency' THEN 'emergency'
        WHEN NEW.priority = 'very_urgent' THEN 'urgent_care'
        ELSE 'general'
    END
    AND active = true
    LIMIT 1;

    -- Criar chamada
    INSERT INTO calls (
        patient_id,
        sector_id,
        triage_id,
        status,
        priority,
        display_name
    )
    SELECT
        NEW.patient_id,
        sectors.id,
        NEW.id,
        'waiting',
        CASE 
            WHEN NEW.priority = 'emergency' THEN 'high'
            WHEN NEW.priority = 'very_urgent' THEN 'high'
            WHEN NEW.priority = 'urgent' THEN 'medium'
            ELSE 'normal'
        END,
        patient_name
    FROM sectors
    WHERE name = sector_name
    AND active = true
    LIMIT 1;

    -- Atualizar status do paciente
    UPDATE patients SET status = 'waiting_doctor' WHERE id = NEW.patient_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS create_call_on_triage ON triage;

-- Criar trigger para criar chamada após triagem
CREATE TRIGGER create_call_on_triage
    AFTER INSERT ON triage
    FOR EACH ROW
    EXECUTE FUNCTION create_call_after_triage(); 