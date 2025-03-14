-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Permitir leitura de roles para usuários autenticados" ON roles;
DROP POLICY IF EXISTS "Permitir gerenciamento de roles para admin" ON roles;
DROP POLICY IF EXISTS "Permitir leitura de user_roles para usuários autenticados" ON user_roles;
DROP POLICY IF EXISTS "Permitir gerenciamento de user_roles para admin" ON user_roles;
DROP POLICY IF EXISTS "Permitir leitura de pacientes para usuários autenticados" ON patients;
DROP POLICY IF EXISTS "Permitir inserção de pacientes para recepcionistas e admin" ON patients;
DROP POLICY IF EXISTS "Permitir atualização de pacientes para recepcionistas e admin" ON patients;

-- Recriar políticas para roles
CREATE POLICY "Permitir leitura de roles para usuários autenticados"
ON roles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir gerenciamento de roles para admin"
ON roles FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name = 'admin'
    )
);

-- Recriar políticas para user_roles
CREATE POLICY "Permitir leitura de user_roles para usuários autenticados"
ON user_roles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir gerenciamento de user_roles para admin"
ON user_roles FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name = 'admin'
    )
);

-- Recriar políticas para patients
CREATE POLICY "Permitir leitura de pacientes para usuários autenticados"
ON patients FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de pacientes para recepcionistas e admin"
ON patients FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'receptionist')
    )
);

CREATE POLICY "Permitir atualização de pacientes para recepcionistas e admin"
ON patients FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'receptionist')
    )
);

-- Inserir role admin para o usuário atual
DO $$
DECLARE
    v_user_id UUID;
    v_role_id UUID;
BEGIN
    -- Obter ID do usuário atual
    v_user_id := auth.uid();
    
    -- Obter ID da role admin
    SELECT id INTO v_role_id
    FROM roles
    WHERE name = 'admin';

    -- Inserir role admin para o usuário atual
    IF v_user_id IS NOT NULL AND v_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id)
        VALUES (v_user_id, v_role_id)
        ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;
END;
$$; 