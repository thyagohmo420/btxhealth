-- Inserir usuário demo se ele não existir
DO $$
BEGIN
    -- Verificar se o usuário já existe
    IF NOT EXISTS (
        SELECT FROM auth.users 
        WHERE email = 'demo@btxhealth.com'
    ) THEN
        -- Inserir o usuário (a senha é 'senha123')
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            confirmation_token,
            confirmation_sent_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin
        ) 
        VALUES (
            uuid_generate_v4(),
            'demo@btxhealth.com',
            '$2a$10$fTLCnbzB2gy8bGEZ/FBRzeMR0ueTVWZh.o8hC6Nh.xr5W1aJONriq', -- 'senha123' encriptada com bcrypt
            now(),
            '',
            now(),
            now(),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"Usuário Demo"}',
            false
        );
    END IF;
END;
$$; 