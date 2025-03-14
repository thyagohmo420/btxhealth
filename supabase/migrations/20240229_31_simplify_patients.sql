-- Remover views dependentes
DROP VIEW IF EXISTS patient_search;

-- Remover colunas não necessárias
ALTER TABLE patients 
    DROP COLUMN IF EXISTS email,
    DROP COLUMN IF EXISTS insurance,
    ALTER COLUMN sus_card DROP NOT NULL,
    ALTER COLUMN emergency_contact DROP NOT NULL;

-- Recriar a view patient_search sem o email
CREATE OR REPLACE VIEW patient_search AS 
SELECT 
    p.id,
    p.full_name,
    p.birth_date,
    p.gender,
    p.cpf,
    p.rg,
    p.sus_card,
    p.phone,
    p.address,
    p.emergency_contact,
    p.created_at,
    p.updated_at,
    to_tsvector('portuguese', 
        coalesce(p.full_name, '') || ' ' || 
        coalesce(p.cpf, '') || ' ' || 
        coalesce(p.rg, '') || ' ' || 
        coalesce(p.sus_card, '') || ' ' || 
        coalesce(p.phone, '')
    ) as search_vector
FROM patients p;

-- Atualizar a view de pacientes
CREATE OR REPLACE VIEW patient_details AS 
SELECT 
    p.id,
    p.full_name,
    p.birth_date,
    p.gender,
    p.cpf,
    p.rg,
    p.sus_card,
    p.phone,
    p.address,
    p.emergency_contact,
    p.created_at,
    p.updated_at
FROM patients p; 