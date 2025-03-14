-- Recriar tabela de dispensação
DROP TABLE IF EXISTS medication_dispensing CASCADE;
CREATE TABLE medication_dispensing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    medication_id UUID NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    dispensed_by UUID NOT NULL,
    dispensed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'cancelled'))
);

-- Adicionar foreign keys para dispensação
ALTER TABLE medication_dispensing
ADD CONSTRAINT medication_dispensing_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES patients(id)
ON DELETE CASCADE;

ALTER TABLE medication_dispensing
ADD CONSTRAINT medication_dispensing_medication_id_fkey 
FOREIGN KEY (medication_id) 
REFERENCES pharmacy(id)
ON DELETE RESTRICT;

ALTER TABLE medication_dispensing
ADD CONSTRAINT medication_dispensing_dispensed_by_fkey 
FOREIGN KEY (dispensed_by) 
REFERENCES auth.users(id)
ON DELETE RESTRICT;

-- Recriar função de atualização de estoque
CREATE OR REPLACE FUNCTION update_pharmacy_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Se for inserção, diminui o estoque
    IF TG_OP = 'INSERT' THEN
        -- Obter o preço atual do medicamento
        SELECT price INTO NEW.unit_price
        FROM pharmacy
        WHERE id = NEW.medication_id;

        -- Atualizar estoque
        UPDATE pharmacy
        SET 
            stock = stock - NEW.quantity,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.medication_id
        AND stock >= NEW.quantity
        RETURNING id INTO NEW.medication_id;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Estoque insuficiente';
        END IF;

        -- Registrar transação financeira
        INSERT INTO financial_transactions (
            type,
            category,
            description,
            amount,
            date,
            payment_method,
            status,
            reference_id,
            reference_type,
            created_by
        ) VALUES (
            'expense',
            'pharmacy',
            'Dispensação de medicamento: ' || (
                SELECT name FROM pharmacy WHERE id = NEW.medication_id
            ),
            NEW.total_price,
            CURRENT_DATE,
            'cash',
            'completed',
            NEW.id,
            'medication_dispensing',
            NEW.dispensed_by
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger de estoque
DROP TRIGGER IF EXISTS update_pharmacy_stock_trigger ON medication_dispensing;
CREATE TRIGGER update_pharmacy_stock_trigger
    BEFORE INSERT ON medication_dispensing
    FOR EACH ROW
    EXECUTE FUNCTION update_pharmacy_stock();

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_medication_dispensing_patient_id ON medication_dispensing(patient_id);
CREATE INDEX IF NOT EXISTS idx_medication_dispensing_medication_id ON medication_dispensing(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_dispensing_status ON medication_dispensing(status);

-- Criar view para dispensação
CREATE OR REPLACE VIEW medication_dispensing_view AS
SELECT 
    md.*,
    p.name as medication_name,
    p.manufacturer,
    p.batch,
    p.unit,
    pat.full_name as patient_name,
    pat.cpf as patient_cpf,
    u.email as dispensed_by_email,
    (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = md.dispensed_by) as dispensed_by_name
FROM medication_dispensing md
LEFT JOIN pharmacy p ON md.medication_id = p.id
LEFT JOIN patients pat ON md.patient_id = pat.id
LEFT JOIN auth.users u ON md.dispensed_by = u.id
ORDER BY md.created_at DESC; 