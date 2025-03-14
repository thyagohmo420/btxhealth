-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Permitir leitura de profissionais" ON professionals;
DROP POLICY IF EXISTS "Permitir gerenciamento de profissionais para admin" ON professionals;
DROP POLICY IF EXISTS "Permitir leitura de setores" ON sectors;
DROP POLICY IF EXISTS "Permitir gerenciamento de setores para admin" ON sectors;
DROP POLICY IF EXISTS "Permitir gerenciamento de setores para administradores" ON sectors;
DROP POLICY IF EXISTS "Permitir leitura de triagem" ON triage;
DROP POLICY IF EXISTS "Permitir inserção de triagem para equipe médica" ON triage;
DROP POLICY IF EXISTS "Permitir atualização de triagem para equipe médica" ON triage;
DROP POLICY IF EXISTS "Permitir leitura de vacinas" ON vaccines;
DROP POLICY IF EXISTS "Permitir inserção de vacinas" ON vaccines;
DROP POLICY IF EXISTS "Permitir atualização de vacinas" ON vaccines;
DROP POLICY IF EXISTS "Permitir deleção de vacinas" ON vaccines;
DROP POLICY IF EXISTS "Permitir leitura de registros de vacinas" ON vaccine_records;
DROP POLICY IF EXISTS "Permitir inserção de registros de vacinas" ON vaccine_records;
DROP POLICY IF EXISTS "Permitir atualização de registros de vacinas" ON vaccine_records;
DROP POLICY IF EXISTS "Permitir leitura de relatórios" ON reports;
DROP POLICY IF EXISTS "Permitir gerenciamento de relatórios para admin" ON reports;

-- Remover e recriar funções de verificação de papel
DROP FUNCTION IF EXISTS auth.check_user_role(text[]);
DROP FUNCTION IF EXISTS auth.is_admin();

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

-- Criar novas políticas
-- Políticas para profissionais
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

-- Políticas para setores
CREATE POLICY "Permitir leitura de setores"
ON sectors FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de setores"
ON sectors FOR INSERT
TO authenticated
WITH CHECK (auth.is_admin());

CREATE POLICY "Permitir atualização de setores"
ON sectors FOR UPDATE
TO authenticated
USING (auth.is_admin());

CREATE POLICY "Permitir deleção de setores"
ON sectors FOR DELETE
TO authenticated
USING (auth.is_admin());

-- Políticas para triagem
CREATE POLICY "Permitir leitura de triagem"
ON triage FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de triagem"
ON triage FOR INSERT
TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

CREATE POLICY "Permitir atualização de triagem"
ON triage FOR UPDATE
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

-- Políticas para vacinas
CREATE POLICY "Permitir leitura de vacinas"
ON vaccines FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de vacinas"
ON vaccines FOR INSERT
TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'nurse', 'pharmacist']));

CREATE POLICY "Permitir atualização de vacinas"
ON vaccines FOR UPDATE
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'nurse', 'pharmacist']));

CREATE POLICY "Permitir deleção de vacinas"
ON vaccines FOR DELETE
TO authenticated
USING (auth.is_admin());

-- Políticas para registros de vacinas
CREATE POLICY "Permitir leitura de registros de vacinas"
ON vaccine_records FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de registros de vacinas"
ON vaccine_records FOR INSERT
TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'nurse']));

CREATE POLICY "Permitir atualização de registros de vacinas"
ON vaccine_records FOR UPDATE
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'nurse']));

-- Políticas para relatórios
CREATE POLICY "Permitir leitura de relatórios"
ON reports FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de relatórios"
ON reports FOR INSERT
TO authenticated
WITH CHECK (auth.is_admin());

CREATE POLICY "Permitir atualização de relatórios"
ON reports FOR UPDATE
TO authenticated
USING (auth.is_admin());

CREATE POLICY "Permitir deleção de relatórios"
ON reports FOR DELETE
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