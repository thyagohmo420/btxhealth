-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Permitir leitura de roles para usuários autenticados" ON roles;
DROP POLICY IF EXISTS "Permitir gerenciamento de roles para admin" ON roles;
DROP POLICY IF EXISTS "Permitir leitura de user_roles para usuários autenticados" ON user_roles;
DROP POLICY IF EXISTS "Permitir gerenciamento de user_roles para admin" ON user_roles;
DROP POLICY IF EXISTS "Permitir leitura de pacientes para usuários autenticados" ON patients;
DROP POLICY IF EXISTS "Permitir inserção de pacientes para recepcionistas e admin" ON patients;
DROP POLICY IF EXISTS "Permitir atualização de pacientes para recepcionistas e admin" ON patients;
DROP POLICY IF EXISTS "Permitir leitura de setores para usuários autenticados" ON sectors;
DROP POLICY IF EXISTS "Permitir gerenciamento de setores para admin" ON sectors;
DROP POLICY IF EXISTS "Permitir leitura de profissionais para usuários autenticados" ON professionals;
DROP POLICY IF EXISTS "Permitir gerenciamento de profissionais para admin" ON professionals;

-- Habilitar RLS em todas as tabelas
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;

-- Criar políticas para roles
CREATE POLICY "Permitir leitura de roles para usuários autenticados"
ON roles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir gerenciamento de roles para admin"
ON roles FOR ALL TO authenticated USING (true);

-- Criar políticas para user_roles
CREATE POLICY "Permitir leitura de user_roles para usuários autenticados"
ON user_roles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir gerenciamento de user_roles para admin"
ON user_roles FOR ALL TO authenticated USING (true);

-- Criar políticas para patients
CREATE POLICY "Permitir leitura de pacientes para usuários autenticados"
ON patients FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de pacientes para usuários autenticados"
ON patients FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir atualização de pacientes para usuários autenticados"
ON patients FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Permitir exclusão de pacientes para usuários autenticados"
ON patients FOR DELETE TO authenticated USING (true);

-- Criar políticas para sectors
CREATE POLICY "Permitir leitura de setores para usuários autenticados"
ON sectors FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir gerenciamento de setores para usuários autenticados"
ON sectors FOR ALL TO authenticated USING (true);

-- Criar políticas para professionals
CREATE POLICY "Permitir leitura de profissionais para usuários autenticados"
ON professionals FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir gerenciamento de profissionais para usuários autenticados"
ON professionals FOR ALL TO authenticated USING (true);

-- Criar políticas para appointments
CREATE POLICY "Permitir leitura de atendimentos para usuários autenticados"
ON appointments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir gerenciamento de atendimentos para usuários autenticados"
ON appointments FOR ALL TO authenticated USING (true);

-- Criar políticas para medical_records
CREATE POLICY "Permitir leitura de prontuários para usuários autenticados"
ON medical_records FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir gerenciamento de prontuários para usuários autenticados"
ON medical_records FOR ALL TO authenticated USING (true);

-- Criar políticas para medical_history
CREATE POLICY "Permitir leitura de histórico médico para usuários autenticados"
ON medical_history FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir gerenciamento de histórico médico para usuários autenticados"
ON medical_history FOR ALL TO authenticated USING (true);

-- Garantir que o usuário atual tenha todas as roles necessárias
DO $$
DECLARE
    v_user_id UUID;
    v_role_record RECORD;
BEGIN
    -- Obter ID do usuário atual
    v_user_id := auth.uid();
    
    -- Inserir todas as roles para o usuário atual
    FOR v_role_record IN SELECT id FROM roles LOOP
        INSERT INTO user_roles (user_id, role_id)
        VALUES (v_user_id, v_role_record.id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
    END LOOP;
END;
$$;

-- Verificar roles do usuário atual
SELECT 
    u.email,
    array_agg(r.name) as roles
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.id = auth.uid()
GROUP BY u.email; 