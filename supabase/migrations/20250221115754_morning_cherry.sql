/*
  # Atualizar políticas de segurança da tabela users

  1. Alterações
    - Adiciona política para permitir inserção de novos usuários durante o cadastro
    - Atualiza política de leitura para permitir acesso aos dados necessários
  
  2. Segurança
    - Mantém RLS ativo
    - Adiciona políticas específicas para cada operação
*/

-- Remover política existente
DROP POLICY IF EXISTS "Users can view their own data" ON users;

-- Política para inserção de novos usuários
CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para leitura de dados
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Política para atualização de dados
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);