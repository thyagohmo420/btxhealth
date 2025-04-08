-- Remover políticas existentes
DROP POLICY IF EXISTS "Permitir acesso anônimo" ON patients;
DROP POLICY IF EXISTS "Permitir leitura para todos os usuários autenticados" ON patients;
DROP POLICY IF EXISTS "Permitir inserção para todos os usuários autenticados" ON patients;
DROP POLICY IF EXISTS "Permitir atualização para todos os usuários autenticados" ON patients;
DROP POLICY IF EXISTS "Permitir exclusão para todos os usuários autenticados" ON patients;

-- Habilitar RLS para a tabela patients
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso anônimo (apenas para desenvolvimento)
CREATE POLICY "Permitir acesso anônimo"
ON patients
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Política para permitir leitura para todos os usuários autenticados
CREATE POLICY "Permitir leitura para todos os usuários autenticados"
ON patients FOR SELECT
TO authenticated
USING (true);

-- Política para permitir inserção para todos os usuários autenticados
CREATE POLICY "Permitir inserção para todos os usuários autenticados"
ON patients FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para permitir atualização para todos os usuários autenticados
CREATE POLICY "Permitir atualização para todos os usuários autenticados"
ON patients FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política para permitir exclusão para todos os usuários autenticados
CREATE POLICY "Permitir exclusão para todos os usuários autenticados"
ON patients FOR DELETE
TO authenticated
USING (true); 