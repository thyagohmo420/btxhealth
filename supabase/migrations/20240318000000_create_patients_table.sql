-- Criar tabela de pacientes
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  cpf TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  service TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('normal', 'priority', 'emergency')),
  status TEXT NOT NULL CHECK (status IN ('reception', 'triage', 'consulting_room', 'completed')),
  triage_data JSONB,
  consult_data JSONB,
  nursing_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Criar índice para busca por status
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);

-- Habilitar Row Level Security (RLS)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Permitir leitura para todos os usuários autenticados" ON patients;
DROP POLICY IF EXISTS "Permitir inserção para todos os usuários autenticados" ON patients;
DROP POLICY IF EXISTS "Permitir atualização para todos os usuários autenticados" ON patients;
DROP POLICY IF EXISTS "Permitir exclusão para todos os usuários autenticados" ON patients;

-- Criar políticas de segurança
CREATE POLICY "Permitir leitura para todos os usuários autenticados"
  ON patients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Permitir inserção para todos os usuários autenticados"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir atualização para todos os usuários autenticados"
  ON patients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão para todos os usuários autenticados"
  ON patients FOR DELETE
  TO authenticated
  USING (true);

-- Criar função para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;

-- Criar trigger para atualizar o updated_at
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 