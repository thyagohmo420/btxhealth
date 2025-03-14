-- Ajustar constraints da tabela patients
ALTER TABLE patients
ALTER COLUMN gender DROP NOT NULL,
ALTER COLUMN birth_date DROP NOT NULL;

-- Ajustar constraints da tabela vaccines
ALTER TABLE vaccines
ALTER COLUMN expiration_date SET DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
ALTER COLUMN stock SET DEFAULT 0,
ALTER COLUMN min_stock SET DEFAULT 0;

-- Criar função para atualizar estoque da farmácia
CREATE OR REPLACE FUNCTION update_pharmacy_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Se for inserção, diminui o estoque
    IF TG_OP = 'INSERT' THEN
        UPDATE pharmacy
        SET stock = stock - NEW.quantity
        WHERE id = NEW.medication_id;
        RETURN NEW;
    -- Se for exclusão, aumenta o estoque
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE pharmacy
        SET stock = stock + OLD.quantity
        WHERE id = OLD.medication_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualização automática do estoque
DROP TRIGGER IF EXISTS update_pharmacy_stock_trigger ON medication_dispensing;
CREATE TRIGGER update_pharmacy_stock_trigger
    AFTER INSERT OR DELETE ON medication_dispensing
    FOR EACH ROW
    EXECUTE FUNCTION update_pharmacy_stock();

-- Criar função para registrar transação financeira
CREATE OR REPLACE FUNCTION register_financial_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Registra uma nova transação financeira
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
        notes,
        created_by
    ) VALUES (
        'expense',
        'pharmacy',
        'Dispensação de medicamento: ' || (
            SELECT name FROM pharmacy WHERE id = NEW.medication_id
        ),
        (
            SELECT COALESCE(price, 0) * NEW.quantity 
            FROM pharmacy 
            WHERE id = NEW.medication_id
        ),
        CURRENT_DATE,
        'cash',
        'completed',
        NEW.id,
        'medication_dispensing',
        NEW.notes,
        NEW.dispensed_by
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para registro automático de transação
DROP TRIGGER IF EXISTS register_financial_transaction_trigger ON medication_dispensing;
CREATE TRIGGER register_financial_transaction_trigger
    AFTER INSERT ON medication_dispensing
    FOR EACH ROW
    EXECUTE FUNCTION register_financial_transaction();

-- Adicionar coluna de preço na tabela pharmacy se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pharmacy' AND column_name = 'price'
    ) THEN
        ALTER TABLE pharmacy ADD COLUMN price DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

-- Criar view para listagem de pacientes
CREATE OR REPLACE VIEW patient_list AS
SELECT 
    p.*,
    COALESCE(
        (SELECT COUNT(*) FROM appointments a WHERE a.patient_id = p.id),
        0
    ) as total_appointments,
    COALESCE(
        (SELECT COUNT(*) FROM medical_records mr WHERE mr.patient_id = p.id),
        0
    ) as total_records,
    COALESCE(
        (SELECT MAX(created_at) FROM medical_records mr WHERE mr.patient_id = p.id),
        NULL
    ) as last_record_date
FROM patients p
WHERE p.active = true
ORDER BY p.created_at DESC;

-- Criar view para estoque de farmácia
CREATE OR REPLACE VIEW pharmacy_stock AS
SELECT 
    p.*,
    COALESCE(
        (SELECT SUM(quantity) FROM medication_dispensing md WHERE md.medication_id = p.id),
        0
    ) as total_dispensed,
    CASE 
        WHEN p.stock <= p.min_stock THEN true 
        ELSE false 
    END as needs_restock
FROM pharmacy p
WHERE p.active = true
ORDER BY p.name ASC;

-- Criar view para transações financeiras
CREATE OR REPLACE VIEW financial_summary AS
SELECT 
    date_trunc('month', date) as month,
    type,
    category,
    COUNT(*) as total_transactions,
    SUM(amount) as total_amount
FROM financial_transactions
GROUP BY date_trunc('month', date), type, category
ORDER BY month DESC, type, category; 