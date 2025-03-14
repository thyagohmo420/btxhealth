-- Adicionar role de recepcionista para o usuário atual
DO $$
DECLARE
    v_user_id UUID;
    v_role_id UUID;
BEGIN
    -- Obter ID do usuário atual
    v_user_id := auth.uid();
    
    -- Obter ID da role receptionist
    SELECT id INTO v_role_id
    FROM roles
    WHERE name = 'receptionist';

    -- Inserir role receptionist para o usuário atual
    IF v_user_id IS NOT NULL AND v_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id)
        VALUES (v_user_id, v_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;
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