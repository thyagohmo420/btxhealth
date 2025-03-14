-- Remover tabelas e views existentes se existirem
DROP VIEW IF EXISTS medications_view;
DROP TABLE IF EXISTS medications CASCADE;

-- Criar função para atualizar o updated_at se ainda não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar tabela de medicações
CREATE TABLE medications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    professional_id UUID REFERENCES professionals(id) NOT NULL,
    medicine VARCHAR(255) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'administered', 'cancelled', 'delayed')) DEFAULT 'pending',
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'low',
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    administered_at TIMESTAMP WITH TIME ZONE,
    nurse_id UUID REFERENCES professionals(id),
    dosage VARCHAR(100) NOT NULL,
    route VARCHAR(50) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar view para medicações
CREATE VIEW medications_view AS
SELECT 
    m.id,
    m.medicine,
    m.status,
    m.priority,
    m.scheduled_for,
    m.administered_at,
    m.dosage,
    m.route,
    m.frequency,
    m.notes,
    m.created_at,
    p.id as patient_id,
    p.full_name as patient_name,
    p.cpf as patient_cpf,
    doc.id as doctor_id,
    doc.full_name as doctor_name,
    doc.specialty as doctor_specialty,
    n.id as nurse_id,
    n.full_name as nurse_name
FROM medications m
JOIN patients p ON m.patient_id = p.id
JOIN professionals doc ON m.professional_id = doc.id
LEFT JOIN professionals n ON m.nurse_id = n.id;

-- Criar trigger para atualizar o updated_at
CREATE TRIGGER update_medications_updated_at
    BEFORE UPDATE ON medications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Criar índices para melhor performance
CREATE INDEX idx_medications_patient_id ON medications(patient_id);
CREATE INDEX idx_medications_professional_id ON medications(professional_id);
CREATE INDEX idx_medications_nurse_id ON medications(nurse_id);
CREATE INDEX idx_medications_status ON medications(status);
CREATE INDEX idx_medications_scheduled_for ON medications(scheduled_for);

-- Criar RLS (Row Level Security) policies
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Medications are viewable by authenticated users" ON medications
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Medications are insertable by authenticated users" ON medications
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Medications are updatable by authenticated users" ON medications
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true); 