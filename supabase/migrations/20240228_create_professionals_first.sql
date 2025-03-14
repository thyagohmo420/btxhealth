-- Criar tabela de profissionais primeiro
CREATE TABLE IF NOT EXISTS professionals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    full_name TEXT NOT NULL,
    registration_number TEXT,
    specialty TEXT,
    sector_id UUID,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

-- Remover funções existentes e suas dependências
DROP FUNCTION IF EXISTS auth.check_user_role(text[]) CASCADE;
DROP FUNCTION IF EXISTS auth.is_admin() CASCADE;

-- Criar função para verificar papel do usuário
CREATE OR REPLACE FUNCTION auth.check_user_role(required_roles text[])
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = ANY(required_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar função para verificar se é admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Permitir leitura de profissionais" ON professionals;
DROP POLICY IF EXISTS "Permitir inserção de profissionais" ON professionals;
DROP POLICY IF EXISTS "Permitir atualização de profissionais" ON professionals;
DROP POLICY IF EXISTS "Permitir deleção de profissionais" ON professionals;

-- Criar políticas para profissionais
CREATE POLICY "Permitir leitura de profissionais"
ON professionals FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de profissionais"
ON professionals FOR INSERT
TO authenticated
WITH CHECK (auth.is_admin());

CREATE POLICY "Permitir atualização de profissionais"
ON professionals FOR UPDATE
TO authenticated
USING (auth.is_admin());

CREATE POLICY "Permitir deleção de profissionais"
ON professionals FOR DELETE
TO authenticated
USING (auth.is_admin());

-- Remover trigger existente
DROP TRIGGER IF EXISTS update_professionals_updated_at ON professionals;

-- Criar trigger para updated_at
CREATE TRIGGER update_professionals_updated_at
    BEFORE UPDATE ON professionals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Recriar políticas para triagem
CREATE POLICY "Permitir inserção de triagem para equipe médica"
ON triage FOR INSERT
TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

CREATE POLICY "Permitir atualização de triagem para equipe médica"
ON triage FOR UPDATE
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

-- Recriar políticas para vacinas
CREATE POLICY "Permitir gerenciamento de vacinas para equipe médica"
ON vaccines FOR ALL
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'nurse', 'pharmacist']));

-- Inserir usuário admin se não existir
INSERT INTO profiles (id, email, full_name, role)
SELECT id, email, email as full_name, 'admin'
FROM auth.users
WHERE email = 'seu.email@exemplo.com' -- Substitua pelo seu email
ON CONFLICT (id) DO UPDATE
SET role = 'admin'
WHERE profiles.role != 'admin'; 