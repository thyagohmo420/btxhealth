-- Criar tabela users se não existir
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    role text CHECK (role IN ('admin', 'doctor', 'nurse', 'receptionist')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Criar função para atualizar updated_at se não existir
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Remover trigger se existir e criar novamente
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at();

-- Inserir usuário admin manualmente (substitua os valores)
INSERT INTO users (id, email, role)
VALUES 
    ('SEU-USER-ID-AQUI', 'seu-email@exemplo.com', 'admin')
ON CONFLICT (id) DO UPDATE 
SET role = 'admin'
WHERE users.role IS NULL; 