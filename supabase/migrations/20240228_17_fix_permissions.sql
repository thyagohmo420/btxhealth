-- Remover todas as políticas existentes
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Enable read access for authenticated users" ON %I', r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON %I', r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON %I', r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir atualização para usuários autenticados" ON %I', r.tablename);
    END LOOP;
END $$;

-- Remover função antiga e todas as dependências
DROP FUNCTION IF EXISTS auth.check_user_role(text[]) CASCADE;

-- Criar nova função simplificada de verificação de roles
CREATE OR REPLACE FUNCTION auth.check_user_role(required_roles text[])
RETURNS boolean AS $$
BEGIN
    -- Verificar se o usuário está autenticado
    IF auth.uid() IS NULL THEN
        RETURN false;
    END IF;

    -- Verificar se o usuário é admin
    IF EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND (
            raw_user_meta_data->>'role' = 'admin'
            OR raw_user_meta_data->>'isAdmin' = 'true'
        )
    ) THEN
        RETURN true;
    END IF;

    -- Verificar roles do usuário
    RETURN EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND (
            raw_user_meta_data->>'role' = ANY(required_roles)
            OR raw_user_meta_data->>'userRole' = ANY(required_roles)
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilitar RLS em todas as tabelas
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccines ENABLE ROW LEVEL SECURITY;

-- Políticas para pacientes
CREATE POLICY "Permitir leitura para usuários autenticados"
ON patients FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção para usuários autenticados"
ON patients FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir atualização para usuários autenticados"
ON patients FOR UPDATE TO authenticated USING (true);

-- Políticas para profissionais
CREATE POLICY "Permitir leitura para usuários autenticados"
ON professionals FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção para usuários autenticados"
ON professionals FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir atualização para usuários autenticados"
ON professionals FOR UPDATE TO authenticated USING (true);

-- Políticas para setores
CREATE POLICY "Permitir leitura para usuários autenticados"
ON sectors FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção para usuários autenticados"
ON sectors FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir atualização para usuários autenticados"
ON sectors FOR UPDATE TO authenticated USING (true);

-- Políticas para prontuários
CREATE POLICY "Permitir leitura para usuários autenticados"
ON medical_records FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção para usuários autenticados"
ON medical_records FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir atualização para usuários autenticados"
ON medical_records FOR UPDATE TO authenticated USING (true);

-- Políticas para triagem
CREATE POLICY "Permitir leitura para usuários autenticados"
ON triage FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção para usuários autenticados"
ON triage FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir atualização para usuários autenticados"
ON triage FOR UPDATE TO authenticated USING (true);

-- Políticas para farmácia
CREATE POLICY "Permitir leitura para usuários autenticados"
ON pharmacy FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção para usuários autenticados"
ON pharmacy FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir atualização para usuários autenticados"
ON pharmacy FOR UPDATE TO authenticated USING (true);

-- Políticas para transações financeiras
CREATE POLICY "Permitir leitura para usuários autenticados"
ON financial_transactions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção para usuários autenticados"
ON financial_transactions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir atualização para usuários autenticados"
ON financial_transactions FOR UPDATE TO authenticated USING (true);

-- Políticas para chamadas
CREATE POLICY "Permitir leitura para usuários autenticados"
ON calls FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção para usuários autenticados"
ON calls FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir atualização para usuários autenticados"
ON calls FOR UPDATE TO authenticated USING (true);

-- Políticas para vacinas
CREATE POLICY "Permitir leitura para usuários autenticados"
ON vaccines FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção para usuários autenticados"
ON vaccines FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Permitir atualização para usuários autenticados"
ON vaccines FOR UPDATE TO authenticated USING (true); 