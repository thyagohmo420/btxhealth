-- Remover funções existentes
DROP FUNCTION IF EXISTS upsert_triage(UUID, UUID, JSONB, TEXT[], TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS update_patient_status(UUID, TEXT, TEXT);

-- Recriar tabela triage
DROP TABLE IF EXISTS triage CASCADE;
CREATE TABLE triage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    professional_id UUID REFERENCES professionals(id) NOT NULL,
    vital_signs JSONB DEFAULT '{
        "blood_pressure": "",
        "heart_rate": "",
        "temperature": "",
        "oxygen_saturation": ""
    }'::jsonb,
    symptoms TEXT[] DEFAULT ARRAY[]::TEXT[],
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'waiting',
    priority TEXT NOT NULL DEFAULT 'normal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_triage_status CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled')),
    CONSTRAINT valid_triage_priority CHECK (priority IN ('emergency', 'urgent', 'high', 'normal', 'low'))
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_triage_patient_id ON triage(patient_id);
CREATE INDEX IF NOT EXISTS idx_triage_status ON triage(status);
CREATE INDEX IF NOT EXISTS idx_triage_priority ON triage(priority);
CREATE INDEX IF NOT EXISTS idx_triage_created_at ON triage(created_at DESC);

-- Habilitar RLS
ALTER TABLE triage ENABLE ROW LEVEL SECURITY;

-- Criar políticas
DROP POLICY IF EXISTS "Permitir leitura de triagens" ON triage;
CREATE POLICY "Permitir leitura de triagens"
ON triage FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Permitir inserção de triagens" ON triage;
CREATE POLICY "Permitir inserção de triagens"
ON triage FOR INSERT TO authenticated
WITH CHECK (
    auth.uid() IN (
        SELECT u.id
        FROM auth.users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        WHERE r.name IN ('admin', 'nurse')
    )
);

DROP POLICY IF EXISTS "Permitir atualização de triagens" ON triage;
CREATE POLICY "Permitir atualização de triagens"
ON triage FOR UPDATE TO authenticated
USING (
    auth.uid() IN (
        SELECT u.id
        FROM auth.users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        WHERE r.name IN ('admin', 'nurse')
    )
);

-- Criar função para atualizar status do paciente
CREATE OR REPLACE FUNCTION update_patient_status()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE patients
    SET 
        status = NEW.status,
        priority = NEW.priority,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.patient_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para atualizar status do paciente
DROP TRIGGER IF EXISTS update_patient_status_trigger ON triage;
CREATE TRIGGER update_patient_status_trigger
    AFTER INSERT OR UPDATE ON triage
    FOR EACH ROW
    EXECUTE FUNCTION update_patient_status();

-- Criar view para triagem
DROP VIEW IF EXISTS triage_view CASCADE;
CREATE VIEW triage_view AS
SELECT 
    t.*,
    p.full_name as patient_name,
    p.cpf,
    p.sus_card,
    p.birth_date,
    p.gender,
    p.blood_type,
    p.allergies,
    p.chronic_conditions,
    prof.full_name as professional_name,
    prof.specialty as professional_specialty
FROM triage t
JOIN patients p ON t.patient_id = p.id
LEFT JOIN professionals prof ON t.professional_id = prof.id
ORDER BY t.created_at DESC; 