-- Remover tabelas e views existentes se existirem
DROP VIEW IF EXISTS exams_view;
DROP TABLE IF EXISTS exams CASCADE;

-- Criar função para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar tabela de exames
CREATE TABLE exams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    professional_id UUID REFERENCES professionals(id) NOT NULL,
    exam_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'low',
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    result_url TEXT,
    result_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar view para exames
CREATE OR REPLACE VIEW exams_view AS
SELECT 
    e.*,
    p.full_name as patient_name,
    p.cpf as patient_cpf,
    prof.full_name as professional_name,
    prof.specialty as professional_specialty
FROM exams e
LEFT JOIN patients p ON e.patient_id = p.id
LEFT JOIN professionals prof ON e.professional_id = prof.id;

-- Habilitar RLS na tabela exams
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- Criar políticas de RLS para a tabela exams
CREATE POLICY "Permitir leitura de exames"
ON exams FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de exames"
ON exams FOR INSERT
TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

CREATE POLICY "Permitir atualização de exames"
ON exams FOR UPDATE
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

-- Criar trigger para atualizar o updated_at
CREATE TRIGGER update_exams_updated_at
    BEFORE UPDATE ON exams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Criar índices para melhor performance
CREATE INDEX idx_exams_patient_id ON exams(patient_id);
CREATE INDEX idx_exams_professional_id ON exams(professional_id);
CREATE INDEX idx_exams_status ON exams(status);
CREATE INDEX idx_exams_scheduled_for ON exams(scheduled_for); 