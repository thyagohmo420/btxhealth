-- Criar tabela de triagem
CREATE TABLE IF NOT EXISTS triage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    symptoms TEXT[] DEFAULT '{}',
    medications TEXT[] DEFAULT '{}',
    allergies TEXT[] DEFAULT '{}',
    vital_signs JSONB NOT NULL,
    priority TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de setores
CREATE TABLE IF NOT EXISTS sectors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    manager TEXT NOT NULL,
    status TEXT NOT NULL,
    schedule TEXT NOT NULL,
    staff INTEGER NOT NULL,
    occupancy INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE triage ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;

-- Políticas para triagem
CREATE POLICY "Permitir leitura de triagem para usuários autenticados"
ON triage FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de triagem para equipe médica"
ON triage FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'doctor', 'nurse')
    )
);

CREATE POLICY "Permitir atualização de triagem para equipe médica"
ON triage FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'doctor', 'nurse')
    )
);

-- Políticas para setores
CREATE POLICY "Permitir leitura de setores para usuários autenticados"
ON sectors FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir gerenciamento de setores para administradores"
ON sectors FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_triage_updated_at
    BEFORE UPDATE ON triage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sectors_updated_at
    BEFORE UPDATE ON sectors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 