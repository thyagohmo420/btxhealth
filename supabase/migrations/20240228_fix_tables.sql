-- Verificar e criar tabela de triagem
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

-- Corrigir tabela de vacinas
ALTER TABLE IF EXISTS vaccines
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Recriar tabela de vacinas se necessário
DROP TABLE IF EXISTS vaccines CASCADE;
CREATE TABLE vaccines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    batch TEXT NOT NULL,
    expiration_date DATE NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'dose',
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT stock_positive CHECK (stock >= 0),
    CONSTRAINT min_stock_positive CHECK (min_stock >= 0)
);

-- Verificar e criar tabela de setores
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

-- Verificar e criar tabela de relatórios
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    parameters JSONB DEFAULT '{}'::jsonb,
    generated_by UUID REFERENCES auth.users(id) NOT NULL,
    file_url TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS nas tabelas
ALTER TABLE triage ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Políticas para triagem
DROP POLICY IF EXISTS "Permitir leitura de triagem para usuários autenticados" ON triage;
DROP POLICY IF EXISTS "Permitir inserção de triagem para equipe médica" ON triage;
DROP POLICY IF EXISTS "Permitir atualização de triagem para equipe médica" ON triage;

CREATE POLICY "Permitir leitura de triagem para usuários autenticados"
ON triage FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de triagem para equipe médica"
ON triage FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.role IN ('admin', 'doctor', 'nurse')
    )
);

CREATE POLICY "Permitir atualização de triagem para equipe médica"
ON triage FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.role IN ('admin', 'doctor', 'nurse')
    )
);

-- Políticas para vacinas
DROP POLICY IF EXISTS "Permitir leitura de vacinas" ON vaccines;
DROP POLICY IF EXISTS "Permitir inserção de vacinas" ON vaccines;
DROP POLICY IF EXISTS "Permitir atualização de vacinas" ON vaccines;
DROP POLICY IF EXISTS "Permitir deleção de vacinas" ON vaccines;

CREATE POLICY "Permitir leitura de vacinas"
ON vaccines FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de vacinas"
ON vaccines FOR INSERT
TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'nurse']));

CREATE POLICY "Permitir atualização de vacinas"
ON vaccines FOR UPDATE
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'nurse']));

CREATE POLICY "Permitir deleção de vacinas"
ON vaccines FOR DELETE
TO authenticated
USING (auth.is_admin());

-- Políticas para setores
DROP POLICY IF EXISTS "Permitir leitura de setores para usuários autenticados" ON sectors;
DROP POLICY IF EXISTS "Permitir gerenciamento de setores para administradores" ON sectors;

CREATE POLICY "Permitir leitura de setores para usuários autenticados"
ON sectors FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir gerenciamento de setores para administradores"
ON sectors FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.role = 'admin'
    )
);

-- Políticas para relatórios
DROP POLICY IF EXISTS "Permitir leitura de relatórios para usuários autenticados" ON reports;
DROP POLICY IF EXISTS "Permitir gerenciamento de relatórios para admin" ON reports;

CREATE POLICY "Permitir leitura de relatórios para usuários autenticados"
ON reports FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir gerenciamento de relatórios para admin"
ON reports FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.role = 'admin'
    )
);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para updated_at
DROP TRIGGER IF EXISTS update_triage_updated_at ON triage;
DROP TRIGGER IF EXISTS update_vaccines_updated_at ON vaccines;
DROP TRIGGER IF EXISTS update_sectors_updated_at ON sectors;
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;

CREATE TRIGGER update_triage_updated_at
    BEFORE UPDATE ON triage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vaccines_updated_at
    BEFORE UPDATE ON vaccines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sectors_updated_at
    BEFORE UPDATE ON sectors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 