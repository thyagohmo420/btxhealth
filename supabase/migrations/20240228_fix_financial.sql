-- Recriar tabela de transações financeiras
DROP TABLE IF EXISTS financial_transactions CASCADE;
CREATE TABLE financial_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    reference_id UUID,
    reference_type TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas para transações financeiras
DROP POLICY IF EXISTS "Permitir leitura de transações" ON financial_transactions;
DROP POLICY IF EXISTS "Permitir inserção de transações" ON financial_transactions;
DROP POLICY IF EXISTS "Permitir atualização de transações" ON financial_transactions;
DROP POLICY IF EXISTS "Permitir deleção de transações" ON financial_transactions;

CREATE POLICY "Permitir leitura de transações"
ON financial_transactions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de transações"
ON financial_transactions FOR INSERT
TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'financial']));

CREATE POLICY "Permitir atualização de transações"
ON financial_transactions FOR UPDATE
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'financial']));

CREATE POLICY "Permitir deleção de transações"
ON financial_transactions FOR DELETE
TO authenticated
USING (auth.is_admin());

-- Trigger para atualização de timestamp
DROP TRIGGER IF EXISTS update_financial_transactions_updated_at ON financial_transactions;
CREATE TRIGGER update_financial_transactions_updated_at
    BEFORE UPDATE ON financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Criar view para relatório financeiro
CREATE OR REPLACE VIEW financial_report AS
SELECT 
    date_trunc('month', date) as month,
    type,
    category,
    SUM(amount) as total_amount,
    COUNT(*) as transaction_count
FROM financial_transactions
GROUP BY date_trunc('month', date), type, category
ORDER BY month DESC, type, category;

-- Criar view para fluxo de caixa
CREATE OR REPLACE VIEW cash_flow AS
SELECT 
    date,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as balance
FROM financial_transactions
GROUP BY date
ORDER BY date DESC; 