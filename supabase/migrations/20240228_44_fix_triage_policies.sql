-- Remover políticas antigas
DROP POLICY IF EXISTS "Permitir leitura de triagens" ON triage;
DROP POLICY IF EXISTS "Permitir inserção de triagens" ON triage;
DROP POLICY IF EXISTS "Permitir atualização de triagens" ON triage;

-- Criar novas políticas sem recursão
CREATE POLICY "Permitir leitura de triagens"
ON triage FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de triagens"
ON triage FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'nurse')
    )
);

CREATE POLICY "Permitir atualização de triagens"
ON triage FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'nurse')
    )
);

-- Criar política de deleção (opcional)
DROP POLICY IF EXISTS "Permitir deleção de triagens" ON triage;
CREATE POLICY "Permitir deleção de triagens"
ON triage FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name = 'admin'
    )
); 