-- Criar tabela de atendimentos
CREATE TABLE appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    professional_id UUID REFERENCES professionals(id) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled')) DEFAULT 'waiting',
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'low',
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar view para atendimentos
CREATE VIEW appointments_view AS
SELECT 
    a.id,
    a.status,
    a.priority,
    a.start_time,
    a.end_time,
    a.notes,
    a.created_at,
    p.full_name as patient_name,
    p.cpf as patient_cpf,
    prof.full_name as professional_name,
    prof.specialty as professional_specialty
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN professionals prof ON a.professional_id = prof.id;

-- Criar trigger para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Criar índices para melhor performance
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_professional_id ON appointments(professional_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_created_at ON appointments(created_at);

-- Criar RLS (Row Level Security) policies
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Appointments are viewable by authenticated users" ON appointments
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Appointments are insertable by authenticated users" ON appointments
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Appointments are updatable by authenticated users" ON appointments
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true); 