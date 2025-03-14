-- Recriar tabela de farmácia
DROP TABLE IF EXISTS pharmacy CASCADE;
CREATE TABLE pharmacy (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    active_ingredient TEXT NOT NULL,
    form TEXT NOT NULL,
    concentration TEXT,
    manufacturer TEXT NOT NULL,
    batch TEXT NOT NULL,
    expiration_date DATE NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'unidade',
    controlled BOOLEAN DEFAULT false,
    storage_location TEXT,
    temperature_control TEXT,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT stock_positive CHECK (stock >= 0),
    CONSTRAINT min_stock_positive CHECK (min_stock >= 0)
);

-- Recriar tabela de dispensação
DROP TABLE IF EXISTS medication_dispensing CASCADE;
CREATE TABLE medication_dispensing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medication_id UUID REFERENCES pharmacy(id) NOT NULL,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    professional_id UUID REFERENCES professionals(id) NOT NULL,
    quantity INTEGER NOT NULL,
    dispensed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    prescription_id UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT quantity_positive CHECK (quantity > 0)
);

-- Habilitar RLS
ALTER TABLE pharmacy ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_dispensing ENABLE ROW LEVEL SECURITY;

-- Políticas para farmácia
DROP POLICY IF EXISTS "Permitir leitura de medicamentos" ON pharmacy;
DROP POLICY IF EXISTS "Permitir inserção de medicamentos" ON pharmacy;
DROP POLICY IF EXISTS "Permitir atualização de medicamentos" ON pharmacy;
DROP POLICY IF EXISTS "Permitir deleção de medicamentos" ON pharmacy;

CREATE POLICY "Permitir leitura de medicamentos"
ON pharmacy FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de medicamentos"
ON pharmacy FOR INSERT
TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'pharmacist']));

CREATE POLICY "Permitir atualização de medicamentos"
ON pharmacy FOR UPDATE
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'pharmacist']));

CREATE POLICY "Permitir deleção de medicamentos"
ON pharmacy FOR DELETE
TO authenticated
USING (auth.is_admin());

-- Políticas para dispensação
DROP POLICY IF EXISTS "Permitir leitura de dispensação" ON medication_dispensing;
DROP POLICY IF EXISTS "Permitir inserção de dispensação" ON medication_dispensing;
DROP POLICY IF EXISTS "Permitir atualização de dispensação" ON medication_dispensing;

CREATE POLICY "Permitir leitura de dispensação"
ON medication_dispensing FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de dispensação"
ON medication_dispensing FOR INSERT
TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'pharmacist']));

CREATE POLICY "Permitir atualização de dispensação"
ON medication_dispensing FOR UPDATE
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'pharmacist']));

-- Triggers para atualização de timestamp
DROP TRIGGER IF EXISTS update_pharmacy_updated_at ON pharmacy;
DROP TRIGGER IF EXISTS update_medication_dispensing_updated_at ON medication_dispensing;

CREATE TRIGGER update_pharmacy_updated_at
    BEFORE UPDATE ON pharmacy
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medication_dispensing_updated_at
    BEFORE UPDATE ON medication_dispensing
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar estoque de medicamentos
CREATE OR REPLACE FUNCTION update_medication_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE pharmacy
        SET stock = stock - NEW.quantity
        WHERE id = NEW.medication_id
        AND stock >= NEW.quantity;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Estoque insuficiente';
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE pharmacy
        SET stock = stock + OLD.quantity
        WHERE id = OLD.medication_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar estoque automaticamente
DROP TRIGGER IF EXISTS update_stock_on_dispensing ON medication_dispensing;

CREATE TRIGGER update_stock_on_dispensing
    AFTER INSERT OR DELETE ON medication_dispensing
    FOR EACH ROW
    EXECUTE FUNCTION update_medication_stock(); 