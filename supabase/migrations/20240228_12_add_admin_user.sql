-- Função para adicionar role a um usuário
CREATE OR REPLACE FUNCTION add_role_to_user(user_email TEXT, role_name TEXT)
RETURNS void AS $$
DECLARE
    v_user_id UUID;
    v_role_id UUID;
BEGIN
    -- Obter ID do usuário
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = user_email;

    -- Obter ID da role
    SELECT id INTO v_role_id
    FROM roles
    WHERE name = role_name;

    -- Se encontrou usuário e role, inserir na tabela user_roles
    IF v_user_id IS NOT NULL AND v_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id)
        VALUES (v_user_id, v_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Adicionar role admin ao usuário atual
DO $$
DECLARE
    current_user_email TEXT;
BEGIN
    -- Obter email do usuário atual
    SELECT email INTO current_user_email
    FROM auth.users
    WHERE id = auth.uid();

    -- Adicionar role admin
    PERFORM add_role_to_user(current_user_email, 'admin');
END;
$$; 