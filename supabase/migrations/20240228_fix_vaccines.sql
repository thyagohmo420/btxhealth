-- Remover tabela existente
DROP TABLE IF EXISTS vaccines CASCADE;

-- Criar tabela de vacinas com estrutura correta
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

-- Habilitar RLS
ALTER TABLE vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccine_records ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Permitir leitura de vacinas" ON vaccines;
DROP POLICY IF EXISTS "Permitir gerenciamento de vacinas para equipe médica" ON vaccines;

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

-- Criar triggers para updated_at
DROP TRIGGER IF EXISTS update_vaccines_updated_at ON vaccines;
DROP TRIGGER IF EXISTS update_vaccine_records_updated_at ON vaccine_records;

CREATE TRIGGER update_vaccines_updated_at
    BEFORE UPDATE ON vaccines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vaccine_records_updated_at
    BEFORE UPDATE ON vaccine_records
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
DROP TRIGGER IF EXISTS update_stock_on_vaccine_record ON vaccine_records;

CREATE TRIGGER update_stock_on_vaccine_record
    AFTER INSERT OR DELETE ON vaccine_records
    FOR EACH ROW
    EXECUTE FUNCTION update_vaccine_stock(); 