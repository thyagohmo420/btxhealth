-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Função para remover acentos e normalizar texto para busca
CREATE OR REPLACE FUNCTION normalize_text(text_to_normalize TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(unaccent(text_to_normalize));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para formatar CPF
CREATE OR REPLACE FUNCTION format_cpf(cpf TEXT)
RETURNS TEXT AS $$
BEGIN
    IF cpf IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN regexp_replace(cpf, '(\d{3})(\d{3})(\d{3})(\d{2})', '\1.\2.\3-\4');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para validar CPF
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
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para verificar campos obrigatórios do paciente
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
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para buscar pacientes
CREATE OR REPLACE FUNCTION search_patients(search_term TEXT)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    cpf TEXT,
    sus_card TEXT,
    birth_date DATE,
    gender TEXT,
    phone TEXT,
    health_insurance TEXT,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        format_cpf(p.cpf),
        p.sus_card,
        p.birth_date,
        p.gender,
        p.phone,
        p.health_insurance,
        similarity(normalize_text(p.full_name), normalize_text(search_term)) as similarity
    FROM patients p
    WHERE p.active = true
    AND (
        normalize_text(p.full_name) ILIKE '%' || normalize_text(search_term) || '%'
        OR p.cpf ILIKE '%' || search_term || '%'
        OR p.sus_card ILIKE '%' || search_term || '%'
    )
    ORDER BY similarity DESC, p.full_name
    LIMIT 10;
END;
$$ LANGUAGE plpgsql; 