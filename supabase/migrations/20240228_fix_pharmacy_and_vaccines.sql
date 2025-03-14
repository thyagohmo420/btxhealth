-- Corrigir tabela de vacinas
DROP TABLE IF EXISTS vaccines CASCADE;
CREATE TABLE vaccines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    batch TEXT NOT NULL,
    expiration_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    min_stock INTEGER NOT NULL DEFAULT 10 CHECK (min_stock >= 0),
    unit TEXT NOT NULL DEFAULT 'dose',
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Corrigir tabela de farmácia
DROP TABLE IF EXISTS pharmacy CASCADE;
CREATE TABLE pharmacy (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    active_ingredient TEXT NOT NULL,
    form TEXT NOT NULL,
    concentration TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    batch TEXT NOT NULL,
    expiration_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    min_stock INTEGER NOT NULL DEFAULT 10 CHECK (min_stock >= 0),
    unit TEXT NOT NULL,
    controlled BOOLEAN NOT NULL DEFAULT false,
    storage_location TEXT,
    temperature_control BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy ENABLE ROW LEVEL SECURITY;

-- Políticas para vacinas
CREATE POLICY "Permitir leitura de vacinas para usuários autenticados"
ON vaccines FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de vacinas para enfermeiros e admin"
ON vaccines FOR INSERT
TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'nurse']));

CREATE POLICY "Permitir atualização de vacinas para enfermeiros e admin"
ON vaccines FOR UPDATE
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'nurse']));

-- Políticas para farmácia
CREATE POLICY "Permitir leitura de medicamentos para usuários autenticados"
ON pharmacy FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de medicamentos para farmacêuticos e admin"
ON pharmacy FOR INSERT
TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'pharmacist']));

CREATE POLICY "Permitir atualização de medicamentos para farmacêuticos e admin"
ON pharmacy FOR UPDATE
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'pharmacist']));

-- Triggers para atualização de timestamp
CREATE TRIGGER update_vaccines_updated_at
    BEFORE UPDATE ON vaccines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pharmacy_updated_at
    BEFORE UPDATE ON pharmacy
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar estoque de medicamentos
CREATE OR REPLACE FUNCTION update_medication_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE pharmacy
        SET stock = stock - NEW.quantity
        WHERE id = NEW.medication_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE pharmacy
        SET stock = stock + OLD.quantity
        WHERE id = OLD.medication_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualização automática do estoque
DROP TRIGGER IF EXISTS update_medication_stock_trigger ON medication_dispensing;
CREATE TRIGGER update_medication_stock_trigger
    AFTER INSERT OR DELETE ON medication_dispensing
    FOR EACH ROW
    EXECUTE FUNCTION update_medication_stock(); 