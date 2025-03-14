-- Função para criar chamada automática quando um paciente é registrado na recepção
CREATE OR REPLACE FUNCTION create_reception_call()
RETURNS TRIGGER AS $$
DECLARE
    reception_sector_id UUID;
BEGIN
    -- Buscar setor de recepção/triagem
    SELECT id INTO reception_sector_id
    FROM sectors
    WHERE type = 'reception'
    AND active = true
    LIMIT 1;

    IF reception_sector_id IS NULL THEN
        RAISE EXCEPTION 'Setor de recepção não encontrado';
    END IF;

    -- Criar chamada para triagem
    INSERT INTO calls (
        patient_id,
        sector_id,
        status,
        priority,
        display_name
    ) VALUES (
        NEW.id,
        reception_sector_id,
        'waiting',
        NEW.priority,
        COALESCE(NEW.full_name, 'Paciente sem nome')
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar chamada quando paciente é registrado
DROP TRIGGER IF EXISTS create_reception_call_on_patient ON patients;
CREATE TRIGGER create_reception_call_on_patient
    AFTER INSERT ON patients
    FOR EACH ROW
    EXECUTE FUNCTION create_reception_call();

-- Função para atualizar chamada quando o status do paciente muda
CREATE OR REPLACE FUNCTION update_patient_call()
RETURNS TRIGGER AS $$
DECLARE
    target_sector_id UUID;
BEGIN
    -- Se o status mudou para 'in_service', marcar chamada anterior como completed
    IF NEW.status = 'in_service' AND OLD.status != 'in_service' THEN
        UPDATE calls
        SET status = 'completed'
        WHERE patient_id = NEW.id
        AND status IN ('waiting', 'called');
    END IF;

    -- Se o status mudou para 'waiting_doctor', criar nova chamada para consultório
    IF NEW.status = 'waiting_doctor' AND OLD.status != 'waiting_doctor' THEN
        -- Buscar setor de consultório
        SELECT id INTO target_sector_id
        FROM sectors
        WHERE type = 'doctor_office'
        AND active = true
        LIMIT 1;

        IF target_sector_id IS NULL THEN
            RAISE EXCEPTION 'Setor de consultório não encontrado';
        END IF;

        -- Criar nova chamada para consultório
        INSERT INTO calls (
            patient_id,
            sector_id,
            status,
            priority,
            display_name
        ) VALUES (
            NEW.id,
            target_sector_id,
            'waiting',
            NEW.priority,
            COALESCE(NEW.full_name, 'Paciente sem nome')
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar chamadas quando status do paciente muda
DROP TRIGGER IF EXISTS update_patient_call_on_status ON patients;
CREATE TRIGGER update_patient_call_on_status
    AFTER UPDATE OF status ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_call();

-- Garantir que temos os tipos de setores necessários
INSERT INTO sectors (name, type, description, capacity, manager, status, schedule, staff)
SELECT 'Recepção', 'reception', 'Setor de recepção e triagem', 50, 'Administração', 'active', '24h', 2
WHERE NOT EXISTS (
    SELECT 1 FROM sectors WHERE type = 'reception' AND active = true
);

INSERT INTO sectors (name, type, description, capacity, manager, status, schedule, staff)
SELECT 'Consultório Médico', 'doctor_office', 'Setor de consultas médicas', 30, 'Direção Clínica', 'active', '24h', 5
WHERE NOT EXISTS (
    SELECT 1 FROM sectors WHERE type = 'doctor_office' AND active = true
); 