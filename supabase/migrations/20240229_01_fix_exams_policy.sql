-- Remover políticas existentes
DROP POLICY IF EXISTS "Permitir leitura de exames" ON exams;
DROP POLICY IF EXISTS "Permitir inserção de exames" ON exams;
DROP POLICY IF EXISTS "Permitir atualização de exames" ON exams;

-- Criar novas políticas
CREATE POLICY "Permitir leitura de exames para todos usuários autenticados"
ON exams FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de exames para todos usuários autenticados"
ON exams FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Permitir atualização de exames para todos usuários autenticados"
ON exams FOR UPDATE
TO authenticated
USING (true); 