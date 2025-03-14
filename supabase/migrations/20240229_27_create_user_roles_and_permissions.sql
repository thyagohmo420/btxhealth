-- Criar tabela de permissões se não existir
CREATE TABLE IF NOT EXISTS permissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    module text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Criar tabela de role_permissions se não existir
CREATE TABLE IF NOT EXISTS role_permissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    role text NOT NULL,
    permission_id uuid REFERENCES permissions(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(role, permission_id)
);

-- Inserir permissões básicas
INSERT INTO permissions (module, description) VALUES
    ('inicio', 'Acesso à página inicial'),
    ('triagem', 'Acesso ao módulo de triagem'),
    ('prontuario', 'Acesso ao prontuário eletrônico'),
    ('medicacao', 'Acesso ao módulo de medicação'),
    ('regulacao', 'Acesso ao módulo de regulação'),
    ('admin', 'Acesso administrativo completo')
ON CONFLICT DO NOTHING;

-- Configurar permissões por papel
DO $$
DECLARE
    v_inicio_id uuid;
    v_triagem_id uuid;
    v_prontuario_id uuid;
    v_medicacao_id uuid;
    v_regulacao_id uuid;
    v_admin_id uuid;
BEGIN
    -- Obter IDs das permissões
    SELECT id INTO v_inicio_id FROM permissions WHERE module = 'inicio';
    SELECT id INTO v_triagem_id FROM permissions WHERE module = 'triagem';
    SELECT id INTO v_prontuario_id FROM permissions WHERE module = 'prontuario';
    SELECT id INTO v_medicacao_id FROM permissions WHERE module = 'medicacao';
    SELECT id INTO v_regulacao_id FROM permissions WHERE module = 'regulacao';
    SELECT id INTO v_admin_id FROM permissions WHERE module = 'admin';

    -- Permissões para recepcionistas
    INSERT INTO role_permissions (role, permission_id) VALUES
        ('receptionist', v_inicio_id),
        ('receptionist', v_triagem_id);

    -- Permissões para enfermeiros
    INSERT INTO role_permissions (role, permission_id) VALUES
        ('nurse', v_triagem_id),
        ('nurse', v_medicacao_id),
        ('nurse', v_prontuario_id);

    -- Permissões para médicos
    INSERT INTO role_permissions (role, permission_id) VALUES
        ('doctor', v_inicio_id),
        ('doctor', v_triagem_id),
        ('doctor', v_prontuario_id),
        ('doctor', v_medicacao_id),
        ('doctor', v_regulacao_id);

    -- Permissões para admin (diretores)
    INSERT INTO role_permissions (role, permission_id) VALUES
        ('admin', v_inicio_id),
        ('admin', v_triagem_id),
        ('admin', v_prontuario_id),
        ('admin', v_medicacao_id),
        ('admin', v_regulacao_id),
        ('admin', v_admin_id);
END $$;

-- Criar função para verificar permissão
CREATE OR REPLACE FUNCTION check_user_permission(module_name text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM users u
        JOIN role_permissions rp ON u.role = rp.role
        JOIN permissions p ON rp.permission_id = p.id
        WHERE u.id = auth.uid()
        AND p.module = module_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 