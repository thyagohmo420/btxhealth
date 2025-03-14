-- Recriar tabela de chamadas
DROP TABLE IF EXISTS calls CASCADE;
CREATE TABLE calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    sector_id UUID REFERENCES sectors(id) NOT NULL,
    professional_id UUID REFERENCES professionals(id),
    triage_id UUID REFERENCES triage(id),
    status TEXT NOT NULL DEFAULT 'waiting',
    priority TEXT NOT NULL DEFAULT 'normal',
    called_at TIMESTAMP WITH TIME ZONE,
    display_name TEXT NOT NULL,
    room_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- Políticas para chamadas
DROP POLICY IF EXISTS "Permitir leitura de chamadas" ON calls;
DROP POLICY IF EXISTS "Permitir inserção de chamadas" ON calls;
DROP POLICY IF EXISTS "Permitir atualização de chamadas" ON calls;
DROP POLICY IF EXISTS "Permitir deleção de chamadas" ON calls;

CREATE POLICY "Permitir leitura de chamadas"
ON calls FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de chamadas"
ON calls FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Permitir atualização de chamadas"
ON calls FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Permitir deleção de chamadas"
ON calls FOR DELETE
TO authenticated
USING (auth.is_admin());

-- Trigger para atualização de timestamp
DROP TRIGGER IF EXISTS update_calls_updated_at ON calls;
CREATE TRIGGER update_calls_updated_at
    BEFORE UPDATE ON calls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Adicionar restrição UNIQUE para nome do setor
ALTER TABLE sectors ADD CONSTRAINT sectors_name_key UNIQUE (name);

-- Garantir que temos os setores necessários
DO $$
BEGIN
    -- Tentar inserir Recepção
    BEGIN
        INSERT INTO sectors (name, type, description, capacity, manager, status, schedule, staff)
        VALUES ('Recepção', 'reception', 'Setor de recepção e triagem', 50, 'Administração', 'active', '24h', 2);
    EXCEPTION WHEN unique_violation THEN
        UPDATE sectors 
        SET type = 'reception',
            description = 'Setor de recepção e triagem',
            capacity = 50,
            manager = 'Administração',
            status = 'active',
            schedule = '24h',
            staff = 2
        WHERE name = 'Recepção';
    END;

    -- Tentar inserir Triagem
    BEGIN
        INSERT INTO sectors (name, type, description, capacity, manager, status, schedule, staff)
        VALUES ('Triagem', 'triage', 'Setor de triagem', 30, 'Enfermagem', 'active', '24h', 3);
    EXCEPTION WHEN unique_violation THEN
        UPDATE sectors 
        SET type = 'triage',
            description = 'Setor de triagem',
            capacity = 30,
            manager = 'Enfermagem',
            status = 'active',
            schedule = '24h',
            staff = 3
        WHERE name = 'Triagem';
    END;

    -- Tentar inserir Consultório Médico
    BEGIN
        INSERT INTO sectors (name, type, description, capacity, manager, status, schedule, staff)
        VALUES ('Consultório Médico', 'doctor_office', 'Setor de consultas médicas', 30, 'Direção Clínica', 'active', '24h', 5);
    EXCEPTION WHEN unique_violation THEN
        UPDATE sectors 
        SET type = 'doctor_office',
            description = 'Setor de consultas médicas',
            capacity = 30,
            manager = 'Direção Clínica',
            status = 'active',
            schedule = '24h',
            staff = 5
        WHERE name = 'Consultório Médico';
    END;

    -- Tentar inserir Emergência
    BEGIN
        INSERT INTO sectors (name, type, description, capacity, manager, status, schedule, staff)
        VALUES ('Emergência', 'emergency', 'Setor de emergência', 20, 'Direção Clínica', 'active', '24h', 8);
    EXCEPTION WHEN unique_violation THEN
        UPDATE sectors 
        SET type = 'emergency',
            description = 'Setor de emergência',
            capacity = 20,
            manager = 'Direção Clínica',
            status = 'active',
            schedule = '24h',
            staff = 8
        WHERE name = 'Emergência';
    END;

    -- Tentar inserir Urgência
    BEGIN
        INSERT INTO sectors (name, type, description, capacity, manager, status, schedule, staff)
        VALUES ('Urgência', 'urgent_care', 'Setor de urgência', 25, 'Direção Clínica', 'active', '24h', 6);
    EXCEPTION WHEN unique_violation THEN
        UPDATE sectors 
        SET type = 'urgent_care',
            description = 'Setor de urgência',
            capacity = 25,
            manager = 'Direção Clínica',
            status = 'active',
            schedule = '24h',
            staff = 6
        WHERE name = 'Urgência';
    END;
END $$; 