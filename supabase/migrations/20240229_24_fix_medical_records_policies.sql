-- Remover TODAS as políticas existentes da tabela medical_records
DROP POLICY IF EXISTS "medical_records_select_policy" ON medical_records;
DROP POLICY IF EXISTS "medical_records_insert_policy" ON medical_records;
DROP POLICY IF EXISTS "medical_records_update_policy" ON medical_records;

-- Habilitar RLS na tabela medical_records
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Criar função para verificar o papel do usuário
CREATE OR REPLACE FUNCTION public.check_user_role(required_roles text[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Se não houver usuário autenticado, retorna falso
    IF auth.uid() IS NULL THEN
        RETURN false;
    END IF;

    RETURN EXISTS (
        SELECT 1 
        FROM users 
        WHERE id = auth.uid() 
        AND role = ANY(required_roles)
    );
END;
$$;

-- Criar novas políticas para medical_records
CREATE POLICY "medical_records_select_policy"
ON medical_records FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "medical_records_insert_policy"
ON medical_records FOR INSERT
TO authenticated
WITH CHECK (
    public.check_user_role(ARRAY['admin', 'doctor', 'nurse', 'receptionist'])
);

CREATE POLICY "medical_records_update_policy"
ON medical_records FOR UPDATE
TO authenticated
USING (
    public.check_user_role(ARRAY['admin', 'doctor', 'nurse'])
);

-- Criar função para adicionar usuário admin
CREATE OR REPLACE FUNCTION public.ensure_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.users (id, email, role)
    VALUES (NEW.id, NEW.email, 'admin')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Criar trigger para adicionar usuário automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_user_role();

-- Inserir usuário atual como admin se existir e não estiver na tabela users
DO $$
BEGIN
    IF auth.uid() IS NOT NULL THEN
        INSERT INTO users (id, email, role)
        VALUES (
            auth.uid(),
            (SELECT email FROM auth.users WHERE id = auth.uid()),
            'admin'
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
END
$$; 