-- Habilitar RLS para todas as tabelas
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_dispensing ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- Função para verificar roles do usuário
CREATE OR REPLACE FUNCTION auth.check_user_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM auth.users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        WHERE u.id = auth.uid()
        AND r.name = ANY(required_roles)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para setores
CREATE POLICY "Permitir leitura de setores para usuários autenticados"
ON sectors FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir gerenciamento de setores para admin"
ON sectors FOR ALL TO authenticated
USING (auth.check_user_role(ARRAY['admin']));

-- Políticas para profissionais
CREATE POLICY "Permitir leitura de profissionais para usuários autenticados"
ON professionals FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir gerenciamento de profissionais para admin"
ON professionals FOR ALL TO authenticated
USING (auth.check_user_role(ARRAY['admin']));

-- Políticas para pacientes
CREATE POLICY "Permitir leitura de pacientes para usuários autenticados"
ON patients FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de pacientes para recepcionistas e admin"
ON patients FOR INSERT TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'receptionist']));

CREATE POLICY "Permitir atualização de pacientes para recepcionistas e admin"
ON patients FOR UPDATE TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'receptionist']));

-- Políticas para atendimentos
CREATE POLICY "Permitir leitura de atendimentos para usuários autenticados"
ON appointments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de atendimentos para equipe médica"
ON appointments FOR INSERT TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse', 'receptionist']));

CREATE POLICY "Permitir atualização de atendimentos para equipe médica"
ON appointments FOR UPDATE TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse', 'receptionist']));

-- Políticas para prontuário
CREATE POLICY "Permitir leitura de prontuário para equipe médica"
ON medical_records FOR SELECT TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

CREATE POLICY "Permitir inserção de prontuário para equipe médica"
ON medical_records FOR INSERT TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

CREATE POLICY "Permitir atualização de prontuário para médicos"
ON medical_records FOR UPDATE TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'doctor']));

-- Políticas para histórico médico
CREATE POLICY "Permitir leitura de histórico para equipe médica"
ON medical_history FOR SELECT TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

CREATE POLICY "Permitir inserção de histórico para equipe médica"
ON medical_history FOR INSERT TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

CREATE POLICY "Permitir atualização de histórico para médicos"
ON medical_history FOR UPDATE TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'doctor']));

-- Políticas para vacinas
CREATE POLICY "Permitir leitura de vacinas para usuários autenticados"
ON vaccines FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir gerenciamento de vacinas para enfermeiros e admin"
ON vaccines FOR ALL TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'nurse']));

-- Políticas para farmácia
CREATE POLICY "Permitir leitura de medicamentos para usuários autenticados"
ON pharmacy FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir gerenciamento de medicamentos para farmacêuticos e admin"
ON pharmacy FOR ALL TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'pharmacist']));

-- Políticas para dispensação de medicamentos
CREATE POLICY "Permitir leitura de dispensação para usuários autenticados"
ON medication_dispensing FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir dispensação para farmacêuticos e admin"
ON medication_dispensing FOR INSERT TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'pharmacist']));

-- Políticas para transações financeiras
CREATE POLICY "Permitir leitura de transações para usuários autenticados"
ON financial_transactions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir gerenciamento de transações para financeiro e admin"
ON financial_transactions FOR ALL TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'financial'])); 