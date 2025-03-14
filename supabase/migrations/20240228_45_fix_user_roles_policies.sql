-- Remover todas as políticas existentes da tabela user_roles
DROP POLICY IF EXISTS "Permitir leitura de user_roles" ON user_roles;
DROP POLICY IF EXISTS "Permitir inserção de user_roles" ON user_roles;
DROP POLICY IF EXISTS "Permitir atualização de user_roles" ON user_roles;
DROP POLICY IF EXISTS "Permitir deleção de user_roles" ON user_roles;

-- Habilitar RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Criar novas políticas simplificadas
CREATE POLICY "Permitir leitura de user_roles"
ON user_roles FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Permitir gerenciamento de user_roles para admin"
ON user_roles FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM roles r
        WHERE r.id IN (
            SELECT role_id 
            FROM user_roles 
            WHERE user_id = auth.uid()
        )
        AND r.name = 'admin'
    )
);

-- Criar função auxiliar para verificar role do usuário
CREATE OR REPLACE FUNCTION has_role(role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM roles r
        JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = auth.uid()
        AND r.name = role_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar políticas da tabela triage usando a nova função
DROP POLICY IF EXISTS "Permitir leitura de triagens" ON triage;
DROP POLICY IF EXISTS "Permitir inserção de triagens" ON triage;
DROP POLICY IF EXISTS "Permitir atualização de triagens" ON triage;
DROP POLICY IF EXISTS "Permitir deleção de triagens" ON triage;

CREATE POLICY "Permitir leitura de triagens"
ON triage FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de triagens"
ON triage FOR INSERT TO authenticated
WITH CHECK (has_role('admin') OR has_role('nurse'));

CREATE POLICY "Permitir atualização de triagens"
ON triage FOR UPDATE TO authenticated
USING (has_role('admin') OR has_role('nurse'));

CREATE POLICY "Permitir deleção de triagens"
ON triage FOR DELETE TO authenticated
USING (has_role('admin')); 