-- Remover views e funções que dependem da tabela patients
DROP VIEW IF EXISTS patient_details CASCADE;
DROP VIEW IF EXISTS patient_search CASCADE;

-- Atualizar a tabela patients
ALTER TABLE patients
    DROP COLUMN IF EXISTS email,
    DROP COLUMN IF EXISTS insurance,
    ALTER COLUMN sus_card DROP NOT NULL,
    ALTER COLUMN emergency_contact DROP NOT NULL;

-- Recriar a view de busca de pacientes
CREATE OR REPLACE VIEW patient_search AS
SELECT 
    id,
    full_name,
    birth_date,
    cpf,
    phone,
    created_at,
    to_tsvector('portuguese', 
        coalesce(full_name, '') || ' ' || 
        coalesce(cpf, '') || ' ' || 
        coalesce(phone, '')
    ) as search_vector
FROM patients;

-- Recriar a view de detalhes do paciente
CREATE OR REPLACE VIEW patient_details AS 
WITH patient_queue_info AS (
    SELECT 
        patient_id,
        COUNT(*) as total_visits,
        MAX(CASE WHEN status IN ('waiting', 'called', 'in_service') THEN status::text END) as current_status,
        MAX(CASE WHEN status IN ('waiting', 'called', 'in_service') THEN ticket_number END) as current_ticket
    FROM queue_tickets
    GROUP BY patient_id
)
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
    COALESCE(pqi.total_visits, 0) as total_visits,
    pqi.current_status,
    pqi.current_ticket
FROM patients p
LEFT JOIN patient_queue_info pqi ON p.id = pqi.patient_id;

-- Recriar o índice de busca
DROP INDEX IF EXISTS patient_search_idx;
CREATE INDEX patient_search_idx ON patients USING GIN (to_tsvector('portuguese', 
    coalesce(full_name, '') || ' ' || 
    coalesce(cpf, '') || ' ' || 
    coalesce(phone, '')
)); 