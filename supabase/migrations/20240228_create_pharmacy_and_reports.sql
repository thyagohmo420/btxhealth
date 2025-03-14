-- Tabela de farmácia
CREATE TABLE IF NOT EXISTS pharmacy (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    manufacturer TEXT NOT NULL,
    batch TEXT NOT NULL,
    expiration_date DATE NOT NULL,
    stock INTEGER NOT NULL,
    min_stock INTEGER NOT NULL,
    unit TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de dispensação de medicamentos
CREATE TABLE IF NOT EXISTS medication_dispensing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    medication_id UUID REFERENCES pharmacy(id) NOT NULL,
    quantity INTEGER NOT NULL,
    dispensed_by UUID REFERENCES auth.users(id) NOT NULL,
    dispensed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de chamadas
CREATE TABLE IF NOT EXISTS calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    sector_id UUID REFERENCES sectors(id) NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting',
    priority TEXT NOT NULL DEFAULT 'normal',
    called_at TIMESTAMP WITH TIME ZONE,
    called_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de relatórios
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

-- Habilitar RLS
ALTER TABLE pharmacy ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_dispensing ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Políticas para farmácia
CREATE POLICY "Permitir leitura de medicamentos para usuários autenticados"
ON pharmacy FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir gerenciamento de medicamentos para farmacêuticos e admin"
ON pharmacy FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'pharmacist')
))
WITH CHECK (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'pharmacist')
));

-- Políticas para dispensação
CREATE POLICY "Permitir leitura de dispensação para usuários autenticados"
ON medication_dispensing FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir dispensação para farmacêuticos e admin"
ON medication_dispensing FOR INSERT TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'pharmacist')
));

-- Políticas para chamadas
CREATE POLICY "Permitir leitura de chamadas para usuários autenticados"
ON calls FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir gerenciamento de chamadas para equipe médica"
ON calls FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'doctor', 'nurse')
))
WITH CHECK (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'doctor', 'nurse')
));

-- Políticas para relatórios
CREATE POLICY "Permitir leitura de relatórios para usuários autenticados"
ON reports FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir gerenciamento de relatórios para admin"
ON reports FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
))
WITH CHECK (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
));

-- Triggers para updated_at
CREATE TRIGGER update_pharmacy_updated_at
    BEFORE UPDATE ON pharmacy
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medication_dispensing_updated_at
    BEFORE UPDATE ON medication_dispensing
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calls_updated_at
    BEFORE UPDATE ON calls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 