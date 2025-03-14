-- Habilita RLS para a tabela patients
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de pacientes por usuários autenticados
CREATE POLICY "Usuários autenticados podem inserir pacientes" ON patients
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Política para permitir leitura de pacientes por usuários autenticados
CREATE POLICY "Usuários autenticados podem ler pacientes" ON patients
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Política para permitir atualização de pacientes por usuários autenticados
CREATE POLICY "Usuários autenticados podem atualizar pacientes" ON patients
  FOR UPDATE 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

-- Política para permitir exclusão de pacientes por usuários autenticados
CREATE POLICY "Usuários autenticados podem deletar pacientes" ON patients
  FOR DELETE 
  TO authenticated 
  USING (true);

-- Políticas para a tabela de triagem
CREATE POLICY "Triage viewable by authenticated users"
  ON public.triage
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Triage insertable by medical staff"
  ON public.triage
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'doctor', 'nurse'));

CREATE POLICY "Triage updatable by medical staff"
  ON public.triage
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'doctor', 'nurse'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'doctor', 'nurse'));

CREATE POLICY "Triage deletable by admin"
  ON public.triage
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin'); 