-- Primeiro, vamos verificar se as roles existem
SELECT * FROM roles;

-- Depois, vamos verificar as permissões existentes
SELECT * FROM user_roles;

-- Agora vamos garantir que a view materializada está correta
DROP MATERIALIZED VIEW IF EXISTS user_permissions;
CREATE MATERIALIZED VIEW user_permissions AS
SELECT 
    ur.user_id,
    array_agg(DISTINCT r.name) as roles,
    array_agg(DISTINCT r.id) as role_ids
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY ur.user_id;

-- Criar índice para performance
CREATE UNIQUE INDEX idx_user_permissions_user_id ON user_permissions (user_id);

-- Modificar a função check_user_role para ser mais permissiva durante debug
CREATE OR REPLACE FUNCTION check_user_role(required_roles text[])
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    user_roles text[];
BEGIN
    -- Obter as roles do usuário
    SELECT roles INTO user_roles
    FROM user_permissions
    WHERE user_id = auth.uid();

    -- Se o usuário não tem roles, verificar diretamente
    IF user_roles IS NULL THEN
        SELECT array_agg(DISTINCT r.name)
        INTO user_roles
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid();
    END IF;

    -- Debug
    RAISE NOTICE 'User ID: %, Roles: %, Required: %', auth.uid(), user_roles, required_roles;

    -- Verificar se tem alguma das roles requeridas
    RETURN user_roles && required_roles;
END;
$$;

-- Recriar as políticas de triagem de forma mais simples
DROP POLICY IF EXISTS "triage_select_policy" ON triage;
DROP POLICY IF EXISTS "triage_insert_policy" ON triage;
DROP POLICY IF EXISTS "triage_update_policy" ON triage;
DROP POLICY IF EXISTS "triage_delete_policy" ON triage;

CREATE POLICY "triage_select_policy" ON triage
FOR SELECT TO authenticated USING (true);

CREATE POLICY "triage_insert_policy" ON triage
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'nurse')
    )
);

-- Garantir que o usuário tem acesso à view
GRANT SELECT ON user_permissions TO authenticated;

-- Refresh da view
REFRESH MATERIALIZED VIEW user_permissions; 