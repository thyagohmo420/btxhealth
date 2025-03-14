-- Remover políticas antigas que não queremos mais
DO $$ 
BEGIN
    -- Remover apenas políticas antigas específicas que queremos substituir
    DROP POLICY IF EXISTS "Usuários autenticados podem inserir pacientes" ON patients;
    DROP POLICY IF EXISTS "Usuários autenticados podem ler pacientes" ON patients;
    DROP POLICY IF EXISTS "Usuários autenticados podem atualizar pacientes" ON patients;
    DROP POLICY IF EXISTS "Usuários autenticados podem deletar pacientes" ON patients;
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON patients;
    DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON patients;
    DROP POLICY IF EXISTS "Enable update access for authenticated users" ON patients;
    DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON patients;
    DROP POLICY IF EXISTS "Reception staff can view all patients" ON patients;
    DROP POLICY IF EXISTS "Reception staff can create patients" ON patients;
    DROP POLICY IF EXISTS "Reception staff can update patients" ON patients;
    DROP POLICY IF EXISTS "Patients are viewable by authenticated users" ON patients;
    DROP POLICY IF EXISTS "Patients are insertable by staff" ON patients;
    DROP POLICY IF EXISTS "Patients are updatable by staff" ON patients;

    -- Remover políticas antigas dos profissionais
    DROP POLICY IF EXISTS "Permitir leitura de profissionais" ON professionals;
    DROP POLICY IF EXISTS "Permitir inserção de profissionais" ON professionals;
    DROP POLICY IF EXISTS "Permitir atualização de profissionais" ON professionals;
END $$;

-- Criar novas políticas
CREATE POLICY "Permitir leitura de pacientes para usuários autenticados"
ON patients FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de pacientes para equipe médica"
ON patients FOR INSERT
TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse', 'receptionist']));

CREATE POLICY "Permitir atualização de pacientes para equipe médica"
ON patients FOR UPDATE
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse', 'receptionist']));

-- Remover políticas antigas dos profissionais
DROP POLICY IF EXISTS "Permitir leitura de profissionais" ON professionals;
DROP POLICY IF EXISTS "Permitir inserção de profissionais" ON professionals;
DROP POLICY IF EXISTS "Permitir atualização de profissionais" ON professionals;

-- Criar novas políticas para profissionais
CREATE POLICY "Permitir leitura de profissionais para usuários autenticados"
ON professionals FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de profissionais para administradores"
ON professionals FOR INSERT
TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin']));

CREATE POLICY "Permitir atualização de profissionais para administradores"
ON professionals FOR UPDATE
TO authenticated
USING (auth.check_user_role(ARRAY['admin'])); 