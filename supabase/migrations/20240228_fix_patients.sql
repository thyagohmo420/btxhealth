-- Corrigir tabela de pacientes
DROP TABLE IF EXISTS patients CASCADE;
CREATE TABLE patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    cpf TEXT UNIQUE,
    sus_card TEXT UNIQUE,
    birth_date DATE NOT NULL,
    gender TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    mother_name TEXT,
    father_name TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    blood_type TEXT,
    allergies TEXT[],
    chronic_conditions TEXT[],
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Políticas para pacientes
CREATE POLICY "Permitir leitura de pacientes para usuários autenticados"
ON patients FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de pacientes para recepcionistas e admin"
ON patients FOR INSERT
TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'receptionist']));

CREATE POLICY "Permitir atualização de pacientes para recepcionistas e admin"
ON patients FOR UPDATE
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'receptionist']));

-- Trigger para atualização de timestamp
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Criar view para busca de pacientes
CREATE OR REPLACE VIEW patient_search AS
SELECT 
    id,
    full_name,
    cpf,
    sus_card,
    birth_date,
    phone,
    email,
    active
FROM patients
WHERE active = true
ORDER BY full_name; 