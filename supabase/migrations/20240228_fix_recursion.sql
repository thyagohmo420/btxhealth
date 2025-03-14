-- Remover todas as políticas existentes
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Remover políticas da tabela profiles
    DROP POLICY IF EXISTS "Permitir leitura de perfis" ON profiles;
    DROP POLICY IF EXISTS "Permitir atualização do próprio perfil" ON profiles;
    DROP POLICY IF EXISTS "Permitir gerenciamento de perfis para admin" ON profiles;
    
    -- Remover políticas da tabela triage
    DROP POLICY IF EXISTS "Permitir leitura de triagem" ON triage;
    DROP POLICY IF EXISTS "Permitir inserção de triagem para equipe médica" ON triage;
    DROP POLICY IF EXISTS "Permitir atualização de triagem para equipe médica" ON triage;
    
    -- Remover políticas da tabela sectors
    DROP POLICY IF EXISTS "Permitir leitura de setores" ON sectors;
    DROP POLICY IF EXISTS "Permitir gerenciamento de setores para admin" ON sectors;
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON sectors;
    DROP POLICY IF EXISTS "Enable insert access for admin" ON sectors;
    DROP POLICY IF EXISTS "Enable update access for admin" ON sectors;
    
    -- Remover políticas da tabela vaccines
    DROP POLICY IF EXISTS "Permitir leitura de vacinas" ON vaccines;
    DROP POLICY IF EXISTS "Permitir gerenciamento de vacinas para equipe médica" ON vaccines;
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON vaccines;
    DROP POLICY IF EXISTS "Enable insert access for admin" ON vaccines;
    DROP POLICY IF EXISTS "Enable update access for admin" ON vaccines;
    
    -- Remover políticas da tabela reports
    DROP POLICY IF EXISTS "Permitir leitura de relatórios" ON reports;
    DROP POLICY IF EXISTS "Permitir gerenciamento de relatórios para admin" ON reports;
END $$;

-- Remover funções existentes
DROP FUNCTION IF EXISTS auth.is_admin() CASCADE;
DROP FUNCTION IF EXISTS auth.check_user_role(text[]) CASCADE;

-- Criar função simplificada para verificar se é admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar função simplificada para verificar papel do usuário
CREATE OR REPLACE FUNCTION auth.check_user_role(required_roles text[])
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = ANY(required_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas básicas para profiles
CREATE POLICY "Permitir leitura de perfis"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir atualização do próprio perfil"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Permitir gerenciamento de perfis para admin"
ON profiles FOR ALL
TO authenticated
USING (auth.is_admin());

-- Políticas para triagem
CREATE POLICY "Permitir leitura de triagem"
ON triage FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de triagem para equipe médica"
ON triage FOR INSERT
TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

CREATE POLICY "Permitir atualização de triagem para equipe médica"
ON triage FOR UPDATE
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

-- Políticas para setores
CREATE POLICY "Permitir leitura de setores"
ON sectors FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir gerenciamento de setores para admin"
ON sectors FOR ALL
TO authenticated
USING (auth.is_admin());

-- Políticas para vacinas
CREATE POLICY "Permitir leitura de vacinas"
ON vaccines FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir gerenciamento de vacinas para equipe médica"
ON vaccines FOR ALL
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse', 'pharmacist']));

-- Políticas para relatórios
CREATE POLICY "Permitir leitura de relatórios"
ON reports FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir gerenciamento de relatórios para admin"
ON reports FOR ALL
TO authenticated
USING (auth.is_admin());

-- Inserir usuário admin se não existir
INSERT INTO profiles (id, email, full_name, role)
SELECT id, email, email as full_name, 'admin'
FROM auth.users
WHERE email = 'seu.email@exemplo.com' -- Substitua pelo seu email
ON CONFLICT (id) DO UPDATE
SET role = 'admin'
WHERE profiles.role != 'admin'; 