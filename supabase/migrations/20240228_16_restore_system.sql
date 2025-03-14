-- Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON patients;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON patients;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON patients;
DROP POLICY IF EXISTS "Permitir leitura de pacientes para usuários autenticados" ON patients;
DROP POLICY IF EXISTS "Permitir inserção de pacientes para recepcionistas e admin" ON patients;
DROP POLICY IF EXISTS "Permitir atualização de pacientes para recepcionistas e admin" ON patients;
DROP POLICY IF EXISTS "Users can view all patients" ON patients;
DROP POLICY IF EXISTS "Users can create patients" ON patients;
DROP POLICY IF EXISTS "Users can update patients" ON patients;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON triage;
DROP POLICY IF EXISTS "Permitir leitura de triagem para usuários autenticados" ON triage;
DROP POLICY IF EXISTS "Permitir inserção de triagem para equipe médica" ON triage;
DROP POLICY IF EXISTS "Permitir atualização de triagem para equipe médica" ON triage;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON calls;
DROP POLICY IF EXISTS "Permitir leitura de chamadas" ON calls;
DROP POLICY IF EXISTS "Permitir leitura de chamadas para usuários autenticados" ON calls;
DROP POLICY IF EXISTS "Permitir inserção de chamadas" ON calls;
DROP POLICY IF EXISTS "Permitir atualização de chamadas" ON calls;
DROP POLICY IF EXISTS "Permitir deleção de chamadas" ON calls;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON medication_dispensing;
DROP POLICY IF EXISTS "Permitir leitura de dispensação" ON medication_dispensing;
DROP POLICY IF EXISTS "Permitir leitura de dispensação para usuários autenticados" ON medication_dispensing;
DROP POLICY IF EXISTS "Permitir inserção de dispensação" ON medication_dispensing;
DROP POLICY IF EXISTS "Permitir atualização de dispensação" ON medication_dispensing;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON pharmacy;
DROP POLICY IF EXISTS "Permitir leitura de medicamentos" ON pharmacy;
DROP POLICY IF EXISTS "Permitir leitura de medicamentos para usuários autenticados" ON pharmacy;
DROP POLICY IF EXISTS "Permitir inserção de medicamentos para farmacêuticos e admin" ON pharmacy;
DROP POLICY IF EXISTS "Permitir atualização de medicamentos para farmacêuticos e admin" ON pharmacy;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON vaccines;
DROP POLICY IF EXISTS "Permitir leitura de vacinas" ON vaccines;
DROP POLICY IF EXISTS "Permitir leitura de vacinas para usuários autenticados" ON vaccines;
DROP POLICY IF EXISTS "Permitir inserção de vacinas para enfermeiros e admin" ON vaccines;
DROP POLICY IF EXISTS "Permitir atualização de vacinas para enfermeiros e admin" ON vaccines;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON financial_transactions;
DROP POLICY IF EXISTS "Permitir leitura de transações" ON financial_transactions;
DROP POLICY IF EXISTS "Permitir leitura de transações para usuários autenticados" ON financial_transactions;
DROP POLICY IF EXISTS "Permitir inserção de transações" ON financial_transactions;
DROP POLICY IF EXISTS "Permitir atualização de transações" ON financial_transactions;

-- Agora podemos remover e recriar a função
DROP FUNCTION IF EXISTS auth.check_user_role(text[]);

-- Criar nova função de verificação de roles
CREATE OR REPLACE FUNCTION auth.check_user_role(required_roles text[])
RETURNS boolean AS $$
BEGIN
  -- Verificar se o usuário é admin (sempre tem acesso total)
  IF EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RETURN true;
  END IF;

  -- Verificar se o usuário tem algum dos roles necessários
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = ANY(required_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar todas as políticas necessárias

-- Políticas para pacientes
CREATE POLICY "Permitir leitura de pacientes para usuários autenticados"
ON patients FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de pacientes para recepcionistas e admin"
ON patients FOR INSERT TO authenticated
WITH CHECK (
    auth.check_user_role(ARRAY['admin', 'receptionist'])
);

CREATE POLICY "Permitir atualização de pacientes para recepcionistas e admin"
ON patients FOR UPDATE TO authenticated
USING (
    auth.check_user_role(ARRAY['admin', 'receptionist'])
);

-- Políticas para triagem
CREATE POLICY "Permitir leitura de triagem para usuários autenticados"
ON triage FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de triagem para equipe médica"
ON triage FOR INSERT TO authenticated
WITH CHECK (
    auth.check_user_role(ARRAY['admin', 'doctor', 'nurse'])
);

CREATE POLICY "Permitir atualização de triagem para equipe médica"
ON triage FOR UPDATE TO authenticated
USING (
    auth.check_user_role(ARRAY['admin', 'doctor', 'nurse'])
);

-- Políticas para chamadas
CREATE POLICY "Permitir leitura de chamadas para usuários autenticados"
ON calls FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de chamadas"
ON calls FOR INSERT TO authenticated
WITH CHECK (
    auth.check_user_role(ARRAY['admin', 'receptionist', 'doctor', 'nurse'])
);

CREATE POLICY "Permitir atualização de chamadas"
ON calls FOR UPDATE TO authenticated
USING (
    auth.check_user_role(ARRAY['admin', 'receptionist', 'doctor', 'nurse'])
);

-- Políticas para dispensação de medicamentos
CREATE POLICY "Permitir leitura de dispensação para usuários autenticados"
ON medication_dispensing FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de dispensação"
ON medication_dispensing FOR INSERT TO authenticated
WITH CHECK (
    auth.check_user_role(ARRAY['admin', 'pharmacist'])
);

CREATE POLICY "Permitir atualização de dispensação"
ON medication_dispensing FOR UPDATE TO authenticated
USING (
    auth.check_user_role(ARRAY['admin', 'pharmacist'])
);

-- Políticas para farmácia
CREATE POLICY "Permitir leitura de medicamentos para usuários autenticados"
ON pharmacy FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de medicamentos para farmacêuticos e admin"
ON pharmacy FOR INSERT TO authenticated
WITH CHECK (
    auth.check_user_role(ARRAY['admin', 'pharmacist'])
);

CREATE POLICY "Permitir atualização de medicamentos para farmacêuticos e admin"
ON pharmacy FOR UPDATE TO authenticated
USING (
    auth.check_user_role(ARRAY['admin', 'pharmacist'])
);

-- Políticas para vacinas
CREATE POLICY "Permitir leitura de vacinas para usuários autenticados"
ON vaccines FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de vacinas para enfermeiros e admin"
ON vaccines FOR INSERT TO authenticated
WITH CHECK (
    auth.check_user_role(ARRAY['admin', 'nurse'])
);

CREATE POLICY "Permitir atualização de vacinas para enfermeiros e admin"
ON vaccines FOR UPDATE TO authenticated
USING (
    auth.check_user_role(ARRAY['admin', 'nurse'])
);

-- Políticas para transações financeiras
CREATE POLICY "Permitir leitura de transações para usuários autenticados"
ON financial_transactions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de transações"
ON financial_transactions FOR INSERT TO authenticated
WITH CHECK (
    auth.check_user_role(ARRAY['admin', 'financial'])
);

CREATE POLICY "Permitir atualização de transações"
ON financial_transactions FOR UPDATE TO authenticated
USING (
    auth.check_user_role(ARRAY['admin', 'financial'])
);

-- Garantir que RLS está habilitado em todas as tabelas
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_dispensing ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY; 