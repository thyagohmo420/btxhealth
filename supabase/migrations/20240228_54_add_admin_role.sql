-- Primeiro, remover qualquer role existente para evitar duplicatas
DELETE FROM user_roles 
WHERE user_id = 'ddcf611b-b6a8-405d-a0c4-9961113101ae';

-- Adicionar role de admin
INSERT INTO user_roles (user_id, role_id)
VALUES (
    'ddcf611b-b6a8-405d-a0c4-9961113101ae', -- seu user_id
    'a878d3d1-71d8-4a61-8a81-3242a5cbd25c'  -- id da role admin
);

-- Adicionar role de nurse também para garantir acesso à triagem
INSERT INTO user_roles (user_id, role_id)
VALUES (
    'ddcf611b-b6a8-405d-a0c4-9961113101ae', -- seu user_id
    '59239de9-c998-4b88-961c-6df3bed2639e'  -- id da role nurse
);

-- Atualizar a view materializada
REFRESH MATERIALIZED VIEW user_permissions;

-- Verificar se as roles foram atribuídas corretamente
SELECT 
    au.email,
    array_agg(r.name) as roles
FROM auth.users au
JOIN user_roles ur ON au.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE au.id = 'ddcf611b-b6a8-405d-a0c4-9961113101ae'
GROUP BY au.email; 