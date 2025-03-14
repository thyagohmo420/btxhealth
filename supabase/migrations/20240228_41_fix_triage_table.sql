-- Remover tabela e suas dependências
DROP TABLE IF EXISTS triage CASCADE;

-- Recriar tabela triage com estrutura correta
CREATE TABLE triage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    professional_id UUID NOT NULL,
    vital_signs JSONB NOT NULL DEFAULT '{
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
    CONSTRAINT triage_patient_id_fkey FOREIGN KEY (patient_id)
        REFERENCES patients(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT triage_professional_id_fkey FOREIGN KEY (professional_id)
        REFERENCES professionals(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT valid_triage_status CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled')),
    CONSTRAINT valid_triage_priority CHECK (priority IN ('emergency', 'urgent', 'high', 'normal', 'low'))
);

-- Criar índices
CREATE INDEX idx_triage_patient_id ON triage(patient_id);
CREATE INDEX idx_triage_professional_id ON triage(professional_id);
CREATE INDEX idx_triage_status ON triage(status);
CREATE INDEX idx_triage_priority ON triage(priority);
CREATE INDEX idx_triage_created_at ON triage(created_at DESC);

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
    -- Atualizar status e prioridade do paciente
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
    p.cpf as patient_cpf,
    p.sus_card as patient_sus_card,
    p.birth_date as patient_birth_date,
    p.gender as patient_gender,
    p.blood_type as patient_blood_type,
    p.allergies as patient_allergies,
    p.chronic_conditions as patient_chronic_conditions,
    prof.full_name as professional_name,
    prof.specialty as professional_specialty,
    prof.registration as professional_registration
FROM triage t
JOIN patients p ON t.patient_id = p.id
JOIN professionals prof ON t.professional_id = prof.id
ORDER BY 
    CASE t.priority
        WHEN 'emergency' THEN 1
        WHEN 'urgent' THEN 2
        WHEN 'high' THEN 3
        WHEN 'normal' THEN 4
        WHEN 'low' THEN 5
    END,
    t.created_at DESC;

-- Criar função para buscar triagens por paciente
CREATE OR REPLACE FUNCTION get_patient_triage_history(p_patient_id UUID)
RETURNS TABLE (
    id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    professional_name TEXT,
    professional_specialty TEXT,
    vital_signs JSONB,
    symptoms TEXT[],
    notes TEXT,
    status TEXT,
    priority TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.created_at,
        prof.full_name,
        prof.specialty,
        t.vital_signs,
        t.symptoms,
        t.notes,
        t.status,
        t.priority
    FROM triage t
    JOIN professionals prof ON t.professional_id = prof.id
    WHERE t.patient_id = p_patient_id
    ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 