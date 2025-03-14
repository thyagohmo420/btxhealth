-- Criar tabela de profissionais primeiro
CREATE TABLE IF NOT EXISTS professionals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    full_name TEXT NOT NULL,
    registration_number TEXT,
    specialty TEXT,
    sector_id UUID,  -- Será atualizado depois que a tabela sectors for criada
    active BOOLEAN DEFAULT true,
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

-- Adicionar foreign key de sector_id em professionals
ALTER TABLE professionals
ADD CONSTRAINT fk_professional_sector
FOREIGN KEY (sector_id) REFERENCES sectors(id);

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

-- Criar tabela de vacinas
CREATE TABLE IF NOT EXISTS vaccines (
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

-- Criar tabela de registro de vacinas
CREATE TABLE IF NOT EXISTS vaccine_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vaccine_id UUID REFERENCES vaccines(id) NOT NULL,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    professional_id UUID REFERENCES professionals(id) NOT NULL,
    dose_number INTEGER NOT NULL,
    application_date DATE NOT NULL,
    batch TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT dose_number_positive CHECK (dose_number > 0)
);

-- Criar tabela de relatórios
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

-- Habilitar RLS em todas as tabelas
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccine_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Criar função para verificar papel do usuário
CREATE OR REPLACE FUNCTION auth.check_user_role(required_roles text[])
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = ANY(required_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar função para verificar se é admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para profissionais
CREATE POLICY "Permitir leitura de profissionais"
ON professionals FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir gerenciamento de profissionais para admin"
ON professionals FOR ALL
TO authenticated
USING (auth.is_admin());

-- Políticas para setores
CREATE POLICY "Permitir leitura de setores"
ON sectors FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir gerenciamento de setores para admin"
ON sectors FOR ALL
TO authenticated
USING (auth.is_admin());

-- Políticas para triagem
CREATE POLICY "Permitir leitura de triagem"
ON triage FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de triagem para equipe médica"
ON triage FOR INSERT
TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

CREATE POLICY "Permitir atualização de triagem para equipe médica"
ON triage FOR UPDATE
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

-- Políticas para vacinas
CREATE POLICY "Permitir leitura de vacinas"
ON vaccines FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de vacinas"
ON vaccines FOR INSERT
TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'nurse', 'pharmacist']));

CREATE POLICY "Permitir atualização de vacinas"
ON vaccines FOR UPDATE
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'nurse', 'pharmacist']));

CREATE POLICY "Permitir deleção de vacinas"
ON vaccines FOR DELETE
TO authenticated
USING (auth.is_admin());

-- Políticas para registros de vacinas
CREATE POLICY "Permitir leitura de registros de vacinas"
ON vaccine_records FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de registros de vacinas"
ON vaccine_records FOR INSERT
TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'nurse']));

CREATE POLICY "Permitir atualização de registros de vacinas"
ON vaccine_records FOR UPDATE
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'nurse']));

-- Políticas para relatórios
CREATE POLICY "Permitir leitura de relatórios"
ON reports FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir gerenciamento de relatórios para admin"
ON reports FOR ALL
TO authenticated
USING (auth.is_admin());

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar triggers para updated_at
CREATE TRIGGER update_professionals_updated_at
    BEFORE UPDATE ON professionals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sectors_updated_at
    BEFORE UPDATE ON sectors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_triage_updated_at
    BEFORE UPDATE ON triage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vaccines_updated_at
    BEFORE UPDATE ON vaccines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vaccine_records_updated_at
    BEFORE UPDATE ON vaccine_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar estoque de vacinas
CREATE OR REPLACE FUNCTION update_vaccine_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE vaccines
        SET stock = stock - 1
        WHERE id = NEW.vaccine_id
        AND stock > 0;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE vaccines
        SET stock = stock + 1
        WHERE id = OLD.vaccine_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar estoque automaticamente
CREATE TRIGGER update_stock_on_vaccine_record
    AFTER INSERT OR DELETE ON vaccine_records
    FOR EACH ROW
    EXECUTE FUNCTION update_vaccine_stock(); 