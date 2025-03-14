-- Criar função para verificar permissões de rota
CREATE OR REPLACE FUNCTION check_route_permission(user_id UUID, route TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_roles TEXT[];
BEGIN
    -- Obter roles do usuário
    SELECT ARRAY_AGG(role_name)
    INTO user_roles
    FROM (
        SELECT r.name as role_name
        FROM auth.users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        WHERE u.id = user_id
    ) roles;

    -- Verificar permissões baseado na rota
    CASE route
        WHEN '/electronic-record' THEN
            RETURN 'doctor' = ANY(user_roles) OR 'nurse' = ANY(user_roles) OR 'admin' = ANY(user_roles);
        WHEN '/triage' THEN
            RETURN 'nurse' = ANY(user_roles) OR 'admin' = ANY(user_roles);
        WHEN '/reception' THEN
            RETURN 'receptionist' = ANY(user_roles) OR 'admin' = ANY(user_roles);
        ELSE
            RETURN 'admin' = ANY(user_roles);
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar view para permissões de rota
CREATE OR REPLACE VIEW user_route_permissions AS
SELECT 
    u.id as user_id,
    json_build_object(
        '/electronic-record', check_route_permission(u.id, '/electronic-record'),
        '/triage', check_route_permission(u.id, '/triage'),
        '/reception', check_route_permission(u.id, '/reception')
    ) as route_permissions
FROM auth.users u; 