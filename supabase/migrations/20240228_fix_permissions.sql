-- Criar tabela de perfis de usuário se não existir
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    sector TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT role_check CHECK (role IN ('admin', 'doctor', 'nurse', 'pharmacist', 'receptionist', 'user'))
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
DROP POLICY IF EXISTS "Permitir leitura de perfis para usuários autenticados" ON profiles;
DROP POLICY IF EXISTS "Permitir atualização do próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Permitir gerenciamento de perfis para admin" ON profiles;

CREATE POLICY "Permitir leitura de perfis para usuários autenticados"
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
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Atualizar políticas de triagem
DROP POLICY IF EXISTS "Permitir inserção de triagem para equipe médica" ON triage;
DROP POLICY IF EXISTS "Permitir atualização de triagem para equipe médica" ON triage;

CREATE POLICY "Permitir inserção de triagem para equipe médica"
ON triage FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'doctor', 'nurse')
    )
);

CREATE POLICY "Permitir atualização de triagem para equipe médica"
ON triage FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'doctor', 'nurse')
    )
);

-- Atualizar políticas de setores
DROP POLICY IF EXISTS "Permitir gerenciamento de setores para administradores" ON sectors;

CREATE POLICY "Permitir gerenciamento de setores para administradores"
ON sectors FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Atualizar políticas de vacinas
DROP POLICY IF EXISTS "Permitir gerenciamento de vacinas para equipe médica" ON vaccines;

CREATE POLICY "Permitir gerenciamento de vacinas para equipe médica"
ON vaccines FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'doctor', 'nurse', 'pharmacist')
    )
);

-- Atualizar políticas de relatórios
DROP POLICY IF EXISTS "Permitir gerenciamento de relatórios para admin" ON reports;

CREATE POLICY "Permitir gerenciamento de relatórios para admin"
ON reports FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Função para criar/atualizar perfil após criação do usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'user')
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar/atualizar perfil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir usuário admin se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM profiles WHERE role = 'admin'
    ) THEN
        -- Insira aqui o ID do seu usuário atual
        UPDATE profiles
        SET role = 'admin'
        WHERE email = 'seu.email@exemplo.com'; -- Substitua pelo seu email
    END IF;
END
$$; 