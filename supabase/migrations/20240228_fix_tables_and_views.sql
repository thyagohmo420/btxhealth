-- Remover triggers existentes
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
DROP TRIGGER IF EXISTS update_financial_transactions_updated_at ON financial_transactions;
DROP TRIGGER IF EXISTS update_medical_records_updated_at ON medical_records;
DROP TRIGGER IF EXISTS update_medical_history_updated_at ON medical_history;

-- Criar tabela de atendimentos se não existir
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    professional_id UUID REFERENCES professionals(id) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para atendimentos
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Políticas para atendimentos
DROP POLICY IF EXISTS "Permitir leitura de atendimentos para usuários autenticados" ON appointments;
DROP POLICY IF EXISTS "Permitir inserção de atendimentos para equipe médica" ON appointments;
DROP POLICY IF EXISTS "Permitir atualização de atendimentos para equipe médica" ON appointments;

CREATE POLICY "Permitir leitura de atendimentos para usuários autenticados"
ON appointments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de atendimentos para equipe médica"
ON appointments FOR INSERT
TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse', 'receptionist']));

CREATE POLICY "Permitir atualização de atendimentos para equipe médica"
ON appointments FOR UPDATE
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse', 'receptionist']));

-- Criar trigger para atualização de timestamp em atendimentos
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Criar tabela de transações financeiras se não existir
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    reference_id UUID,
    reference_type TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para transações financeiras
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas para transações financeiras
DROP POLICY IF EXISTS "Permitir leitura de transações para usuários autenticados" ON financial_transactions;
DROP POLICY IF EXISTS "Permitir inserção de transações para admin e financeiro" ON financial_transactions;
DROP POLICY IF EXISTS "Permitir atualização de transações para admin e financeiro" ON financial_transactions;

CREATE POLICY "Permitir leitura de transações para usuários autenticados"
ON financial_transactions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de transações para admin e financeiro"
ON financial_transactions FOR INSERT
TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'financial']));

CREATE POLICY "Permitir atualização de transações para admin e financeiro"
ON financial_transactions FOR UPDATE
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'financial']));

-- Criar trigger para atualização de timestamp em transações financeiras
CREATE TRIGGER update_financial_transactions_updated_at
    BEFORE UPDATE ON financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Criar tabela de prontuário médico
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    professional_id UUID REFERENCES professionals(id) NOT NULL,
    appointment_id UUID REFERENCES appointments(id),
    complaint TEXT NOT NULL,
    diagnosis TEXT,
    prescription TEXT,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de histórico médico
CREATE TABLE IF NOT EXISTS medical_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para prontuário e histórico
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;

-- Políticas para prontuário
DROP POLICY IF EXISTS "Permitir leitura de prontuário para equipe médica" ON medical_records;
DROP POLICY IF EXISTS "Permitir inserção de prontuário para equipe médica" ON medical_records;
DROP POLICY IF EXISTS "Permitir atualização de prontuário para equipe médica" ON medical_records;

CREATE POLICY "Permitir leitura de prontuário para equipe médica"
ON medical_records FOR SELECT
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

CREATE POLICY "Permitir inserção de prontuário para equipe médica"
ON medical_records FOR INSERT
TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

CREATE POLICY "Permitir atualização de prontuário para equipe médica"
ON medical_records FOR UPDATE
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'doctor']));

-- Políticas para histórico médico
DROP POLICY IF EXISTS "Permitir leitura de histórico para equipe médica" ON medical_history;
DROP POLICY IF EXISTS "Permitir inserção de histórico para equipe médica" ON medical_history;
DROP POLICY IF EXISTS "Permitir atualização de histórico para equipe médica" ON medical_history;

CREATE POLICY "Permitir leitura de histórico para equipe médica"
ON medical_history FOR SELECT
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

CREATE POLICY "Permitir inserção de histórico para equipe médica"
ON medical_history FOR INSERT
TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

CREATE POLICY "Permitir atualização de histórico para equipe médica"
ON medical_history FOR UPDATE
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'doctor']));

-- Criar triggers para atualização de timestamp
CREATE TRIGGER update_medical_records_updated_at
    BEFORE UPDATE ON medical_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_history_updated_at
    BEFORE UPDATE ON medical_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Criar view para listar medicamentos ativos
DROP VIEW IF EXISTS active_medications;
CREATE VIEW active_medications AS
SELECT *
FROM pharmacy
WHERE active = true
ORDER BY name;

-- Criar view para listar vacinas ativas
DROP VIEW IF EXISTS active_vaccines;
CREATE VIEW active_vaccines AS
SELECT *
FROM vaccines
WHERE active = true
ORDER BY name;

-- Criar view para listar atendimentos
DROP VIEW IF EXISTS appointments_view;
CREATE VIEW appointments_view AS
SELECT 
    a.*,
    p.full_name as patient_name,
    p.cpf as patient_cpf,
    p.sus_card as patient_sus,
    prof.full_name as professional_name,
    s.name as sector_name
FROM appointments a
LEFT JOIN patients p ON a.patient_id = p.id
LEFT JOIN professionals prof ON a.professional_id = prof.id
LEFT JOIN sectors s ON prof.sector_id = s.id
ORDER BY a.date DESC, a.time DESC;

-- Criar view para relatório financeiro
DROP VIEW IF EXISTS financial_report;
CREATE VIEW financial_report AS
SELECT 
    date_trunc('month', date) as month,
    type,
    category,
    SUM(amount) as total_amount,
    COUNT(*) as transaction_count
FROM financial_transactions
GROUP BY date_trunc('month', date), type, category
ORDER BY month DESC, type, category;

-- Criar view para histórico médico completo
DROP VIEW IF EXISTS patient_medical_history;
CREATE VIEW patient_medical_history AS
SELECT 
    mh.*,
    p.full_name as patient_name,
    p.cpf as patient_cpf,
    p.sus_card as patient_sus
FROM medical_history mh
LEFT JOIN patients p ON mh.patient_id = p.id
ORDER BY mh.date DESC;

-- Criar view para prontuários
DROP VIEW IF EXISTS patient_medical_records;
CREATE VIEW patient_medical_records AS
SELECT 
    mr.*,
    p.full_name as patient_name,
    p.cpf as patient_cpf,
    p.sus_card as patient_sus,
    prof.full_name as professional_name,
    prof.specialty as professional_specialty
FROM medical_records mr
LEFT JOIN patients p ON mr.patient_id = p.id
LEFT JOIN professionals prof ON mr.professional_id = prof.id
ORDER BY mr.created_at DESC; 