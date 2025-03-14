-- Criar tabela de exames
CREATE TABLE IF NOT EXISTS exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    type TEXT NOT NULL,
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    result_date DATE,
    status TEXT NOT NULL DEFAULT 'pending',
    result TEXT,
    files JSONB DEFAULT '[]',
    requested_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'cancelled'))
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_exams_patient_id ON exams(patient_id);
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_exams_request_date ON exams(request_date);

-- Habilitar RLS
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
DROP POLICY IF EXISTS "Permitir leitura de exames para usuários autenticados" ON exams;
CREATE POLICY "Permitir leitura de exames para usuários autenticados"
ON exams FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Permitir inserção de exames para equipe médica" ON exams;
CREATE POLICY "Permitir inserção de exames para equipe médica"
ON exams FOR INSERT TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

DROP POLICY IF EXISTS "Permitir atualização de exames para equipe médica" ON exams;
CREATE POLICY "Permitir atualização de exames para equipe médica"
ON exams FOR UPDATE TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse'])); 