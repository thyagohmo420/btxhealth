-- Remover políticas existentes
DROP POLICY IF EXISTS "Permitir leitura de pacientes para usuários autenticados" ON patients;
DROP POLICY IF EXISTS "Permitir inserção de pacientes para recepcionistas e admin" ON patients;
DROP POLICY IF EXISTS "Permitir atualização de pacientes para recepcionistas e admin" ON patients;

-- Remover views existentes
DROP VIEW IF EXISTS patient_search;
DROP VIEW IF EXISTS appointments_view;
DROP VIEW IF EXISTS patient_medical_records;
DROP VIEW IF EXISTS patient_medical_history;

-- Criar função para formatar CPF
CREATE OR REPLACE FUNCTION format_cpf(cpf TEXT)
RETURNS TEXT AS $$
BEGIN
    IF cpf IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN regexp_replace(cpf, '(\d{3})(\d{3})(\d{3})(\d{2})', '\1.\2.\3-\4');
END;
$$ LANGUAGE plpgsql;

-- Criar função para validar CPF
CREATE OR REPLACE FUNCTION validate_cpf(cpf TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    sum INTEGER;
    digit INTEGER;
    cpf_array INTEGER[];
BEGIN
    IF cpf IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Remover caracteres não numéricos
    cpf := regexp_replace(cpf, '[^0-9]', '', 'g');
    
    -- Verificar tamanho
    IF length(cpf) != 11 THEN
        RETURN FALSE;
    END IF;
    
    -- Converter para array de inteiros
    cpf_array := string_to_array(cpf, NULL)::INTEGER[];
    
    -- Calcular primeiro dígito
    sum := 0;
    FOR i IN 1..9 LOOP
        sum := sum + (cpf_array[i] * (11 - i));
    END LOOP;
    
    digit := 11 - (sum % 11);
    IF digit >= 10 THEN
        digit := 0;
    END IF;
    
    IF digit != cpf_array[10] THEN
        RETURN FALSE;
    END IF;
    
    -- Calcular segundo dígito
    sum := 0;
    FOR i IN 1..10 LOOP
        sum := sum + (cpf_array[i] * (12 - i));
    END LOOP;
    
    digit := 11 - (sum % 11);
    IF digit >= 10 THEN
        digit := 0;
    END IF;
    
    RETURN digit = cpf_array[11];
END;
$$ LANGUAGE plpgsql;

-- Adicionar trigger para validar CPF antes de inserir/atualizar
CREATE OR REPLACE FUNCTION validate_patient_cpf()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.cpf IS NOT NULL AND NOT validate_cpf(NEW.cpf) THEN
        RAISE EXCEPTION 'CPF inválido';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_patient_cpf_trigger ON patients;
CREATE TRIGGER validate_patient_cpf_trigger
    BEFORE INSERT OR UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION validate_patient_cpf();

-- Criar função para verificar campos obrigatórios
CREATE OR REPLACE FUNCTION check_required_patient_fields(
    full_name TEXT,
    birth_date DATE,
    gender TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        full_name IS NOT NULL AND
        birth_date IS NOT NULL AND
        gender IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql;

-- Criar novas políticas para pacientes
CREATE POLICY "Permitir leitura de pacientes para usuários autenticados"
ON patients FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de pacientes para recepcionistas e admin"
ON patients FOR INSERT
TO authenticated
WITH CHECK (
    auth.check_user_role(ARRAY['admin', 'receptionist']) AND
    check_required_patient_fields(full_name, birth_date, gender)
);

CREATE POLICY "Permitir atualização de pacientes para recepcionistas e admin"
ON patients FOR UPDATE
TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'receptionist']));

-- Criar view para busca de pacientes com CPF formatado
CREATE OR REPLACE VIEW patient_search AS
SELECT 
    id,
    full_name,
    format_cpf(cpf) as cpf,
    sus_card,
    birth_date,
    gender,
    phone,
    email,
    address,
    city,
    state,
    zip_code,
    mother_name,
    father_name,
    emergency_contact,
    emergency_phone,
    blood_type,
    allergies,
    chronic_conditions,
    active,
    created_at,
    updated_at
FROM patients
WHERE active = true
ORDER BY full_name;

-- Criar view para atendimentos com informações completas
CREATE OR REPLACE VIEW appointments_view AS
SELECT 
    a.*,
    p.full_name as patient_name,
    format_cpf(p.cpf) as patient_cpf,
    p.sus_card as patient_sus,
    p.birth_date as patient_birth_date,
    p.gender as patient_gender,
    p.phone as patient_phone,
    prof.full_name as professional_name,
    prof.specialty as professional_specialty,
    s.name as sector_name
FROM appointments a
LEFT JOIN patients p ON a.patient_id = p.id
LEFT JOIN professionals prof ON a.professional_id = prof.id
LEFT JOIN sectors s ON prof.sector_id = s.id
ORDER BY a.date DESC, a.time DESC;

-- Criar view para prontuários com informações completas
CREATE OR REPLACE VIEW patient_medical_records AS
SELECT 
    mr.*,
    p.full_name as patient_name,
    format_cpf(p.cpf) as patient_cpf,
    p.sus_card as patient_sus,
    p.birth_date as patient_birth_date,
    p.gender as patient_gender,
    p.blood_type as patient_blood_type,
    p.allergies as patient_allergies,
    p.chronic_conditions as patient_chronic_conditions,
    prof.full_name as professional_name,
    prof.specialty as professional_specialty
FROM medical_records mr
LEFT JOIN patients p ON mr.patient_id = p.id
LEFT JOIN professionals prof ON mr.professional_id = prof.id
ORDER BY mr.created_at DESC;

-- Criar view para histórico médico com informações completas
CREATE OR REPLACE VIEW patient_medical_history AS
SELECT 
    mh.*,
    p.full_name as patient_name,
    format_cpf(p.cpf) as patient_cpf,
    p.sus_card as patient_sus,
    p.birth_date as patient_birth_date,
    p.gender as patient_gender,
    p.blood_type as patient_blood_type,
    p.allergies as patient_allergies,
    p.chronic_conditions as patient_chronic_conditions
FROM medical_history mh
LEFT JOIN patients p ON mh.patient_id = p.id
ORDER BY mh.date DESC;

-- Criar índices para melhorar performance das buscas
DROP INDEX IF EXISTS idx_patients_full_name_trgm;
DROP INDEX IF EXISTS idx_patients_cpf_trgm;
DROP INDEX IF EXISTS idx_patients_sus_card_trgm;

-- Habilitar extensão para busca por similaridade
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Criar índices para busca por similaridade
CREATE INDEX idx_patients_full_name_trgm ON patients USING gin (full_name gin_trgm_ops);
CREATE INDEX idx_patients_cpf_trgm ON patients USING gin (cpf gin_trgm_ops);
CREATE INDEX idx_patients_sus_card_trgm ON patients USING gin (sus_card gin_trgm_ops); 