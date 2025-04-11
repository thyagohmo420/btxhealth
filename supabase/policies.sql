-- Remover políticas existentes
DROP POLICY IF EXISTS "Permitir acesso anônimo" ON patients;
DROP POLICY IF EXISTS "Permitir leitura para todos os usuários autenticados" ON patients;
DROP POLICY IF EXISTS "Permitir inserção para todos os usuários autenticados" ON patients;
DROP POLICY IF EXISTS "Permitir atualização para todos os usuários autenticados" ON patients;
DROP POLICY IF EXISTS "Permitir exclusão para todos os usuários autenticados" ON patients;

-- Habilitar RLS para a tabela patients
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura baseada em função
CREATE POLICY "Permitir leitura baseada em função"
ON patients FOR SELECT
TO authenticated
USING (
  (auth.jwt() ->> 'role') IN ('admin', 'doctor', 'nurse', 'receptionist')
);

-- Política para permitir inserção apenas para recepcionistas e administradores
CREATE POLICY "Permitir inserção para recepcionistas e admins"
ON patients FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'role') IN ('admin', 'receptionist')
);

-- Política para permitir atualização baseada em função
CREATE POLICY "Permitir atualização baseada em função"
ON patients FOR UPDATE
TO authenticated
USING (
  CASE 
    WHEN (auth.jwt() ->> 'role') = 'admin' THEN true
    WHEN (auth.jwt() ->> 'role') = 'doctor' THEN status IN ('in_progress', 'completed')
    WHEN (auth.jwt() ->> 'role') = 'nurse' THEN status IN ('waiting', 'in_progress')
    WHEN (auth.jwt() ->> 'role') = 'receptionist' THEN status = 'waiting'
    ELSE false
  END
)
WITH CHECK (
  CASE 
    WHEN (auth.jwt() ->> 'role') = 'admin' THEN true
    WHEN (auth.jwt() ->> 'role') = 'doctor' THEN status IN ('in_progress', 'completed')
    WHEN (auth.jwt() ->> 'role') = 'nurse' THEN status IN ('waiting', 'in_progress')
    WHEN (auth.jwt() ->> 'role') = 'receptionist' THEN status = 'waiting'
    ELSE false
  END
);

-- Política para permitir exclusão apenas para administradores
CREATE POLICY "Permitir exclusão apenas para admins"
ON patients FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role') = 'admin'); 