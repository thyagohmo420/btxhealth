-- Verificar e criar tabela de profissionais
CREATE TABLE IF NOT EXISTS professionals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    full_name TEXT NOT NULL,
    registration_number TEXT,
    specialty TEXT,
    sector_id UUID REFERENCES sectors(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Permitir leitura de profissionais" ON professionals;
DROP POLICY IF EXISTS "Permitir gerenciamento de profissionais para admin" ON professionals;

-- Políticas para profissionais
CREATE POLICY "Permitir leitura de profissionais"
ON professionals FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir gerenciamento de profissionais para admin"
ON professionals FOR ALL
TO authenticated
USING (auth.is_admin());

-- Criar trigger para updated_at
DROP TRIGGER IF EXISTS update_professionals_updated_at ON professionals;

CREATE TRIGGER update_professionals_updated_at
    BEFORE UPDATE ON professionals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Adicionar permissão para profissionais visualizarem seus próprios dados
CREATE POLICY "Permitir profissionais visualizarem seus dados"
ON professionals FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR
    auth.check_user_role(ARRAY['admin', 'doctor', 'nurse'])
);

-- Adicionar permissão para profissionais atualizarem seus próprios dados
CREATE POLICY "Permitir profissionais atualizarem seus dados"
ON professionals FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid() OR
    auth.is_admin()
); 