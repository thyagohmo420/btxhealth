-- Criar tabela de roles se não existir
CREATE TABLE IF NOT EXISTS roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de user_roles se não existir
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    role_id UUID REFERENCES roles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, role_id)
);

-- Habilitar RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas para roles
CREATE POLICY "Permitir leitura de roles para usuários autenticados"
ON roles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir gerenciamento de roles para admin"
ON roles FOR ALL TO authenticated
USING (auth.check_user_role(ARRAY['admin']));

-- Políticas para user_roles
CREATE POLICY "Permitir leitura de user_roles para usuários autenticados"
ON user_roles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir gerenciamento de user_roles para admin"
ON user_roles FOR ALL TO authenticated
USING (auth.check_user_role(ARRAY['admin']));

-- Inserir roles padrão se não existirem
INSERT INTO roles (name, description)
VALUES
    ('admin', 'Administrador do sistema'),
    ('doctor', 'Médico'),
    ('nurse', 'Enfermeiro'),
    ('receptionist', 'Recepcionista'),
    ('pharmacist', 'Farmacêutico'),
    ('financial', 'Financeiro')
ON CONFLICT (name) DO NOTHING;

-- Criar view para usuários com suas roles
CREATE OR REPLACE VIEW user_roles_view AS
SELECT 
    u.id as user_id,
    u.email,
    array_agg(r.name) as roles
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.id, u.email; 