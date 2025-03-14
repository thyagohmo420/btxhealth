-- Primeiro, remover todas as views que dependem da coluna status
DROP VIEW IF EXISTS public.queue_display CASCADE;
DROP VIEW IF EXISTS public.queue_history CASCADE;
DROP VIEW IF EXISTS public.reception_view CASCADE;
DROP VIEW IF EXISTS public.triage_queue CASCADE;
DROP VIEW IF EXISTS public.patient_queue CASCADE;
DROP VIEW IF EXISTS public.patient_details CASCADE;

-- Alterar a coluna status para text temporariamente
ALTER TABLE queue_tickets 
  ALTER COLUMN status TYPE text;

-- Dropar o enum existente e recriar com os valores corretos
DROP TYPE IF EXISTS queue_status CASCADE;
CREATE TYPE queue_status AS ENUM (
  'em_espera',
  'triagem',
  'em_atendimento',
  'concluido'
);

-- Atualizar os valores existentes para garantir consistência
UPDATE queue_tickets
SET status = 'em_espera' WHERE status = 'waiting';
UPDATE queue_tickets
SET status = 'concluido' WHERE status = 'completed';

-- Converter a coluna status de volta para o enum
ALTER TABLE queue_tickets 
  ALTER COLUMN status TYPE queue_status USING status::queue_status;

-- Criar função para traduzir o status
CREATE OR REPLACE FUNCTION translate_status(status queue_status)
RETURNS text AS $$
BEGIN
    RETURN CASE status
        WHEN 'em_espera' THEN 'Aguardando'
        WHEN 'triagem' THEN 'Em Triagem'
        WHEN 'em_atendimento' THEN 'Em Atendimento'
        WHEN 'concluido' THEN 'Concluído'
        ELSE status::text
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Criar função para traduzir a sala
CREATE OR REPLACE FUNCTION translate_room(room text)
RETURNS text AS $$
BEGIN
    RETURN CASE room
        WHEN 'TRIAGEM_01' THEN 'Triagem 01'
        WHEN 'ATENDIMENTO_01' THEN 'Atendimento Médico 01'
        WHEN 'ATENDIMENTO_02' THEN 'Atendimento Médico 02'
        ELSE room
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Recriar as views necessárias
CREATE VIEW public.queue_display AS
SELECT 
    t.id,
    t.ticket_number,
    p.full_name as patient_name,
    t.room,
    t.status,
    t.called_at,
    t.priority,
    t.completed_at,
    translate_status(t.status) as status_display,
    translate_room(t.room) as room_display
FROM queue_tickets t
JOIN patients p ON p.id = t.patient_id
WHERE DATE(t.called_at) = CURRENT_DATE OR t.status = 'em_espera'
ORDER BY 
    CASE t.status
        WHEN 'em_espera' THEN 1
        WHEN 'triagem' THEN 2
        WHEN 'em_atendimento' THEN 3
        ELSE 4
    END,
    t.called_at DESC NULLS LAST;

-- Recriar a view queue_history
CREATE VIEW public.queue_history AS
SELECT 
    t.id,
    t.ticket_number,
    p.full_name as patient_name,
    t.room,
    t.status,
    t.called_at,
    t.completed_at,
    t.priority,
    translate_status(t.status) as status_display
FROM queue_tickets t
JOIN patients p ON p.id = t.patient_id
WHERE t.status = 'concluido'
ORDER BY t.completed_at DESC;

-- Recriar a view reception_view
CREATE VIEW public.reception_view AS
SELECT 
    p.id,
    p.full_name,
    p.birth_date,
    p.cpf,
    p.rg,
    p.gender,
    p.phone,
    p.email,
    p.address,
    p.city,
    p.state,
    p.zip_code,
    p.created_at,
    p.updated_at,
    p.emergency_contact,
    COALESCE(t.status::text, 'sem_senha') as ticket_status,
    t.ticket_number,
    t.called_at,
    t.priority as ticket_priority
FROM patients p
LEFT JOIN LATERAL (
    SELECT *
    FROM queue_tickets qt
    WHERE qt.patient_id = p.id
    AND qt.status IN ('em_espera', 'triagem', 'em_atendimento')
    ORDER BY qt.created_at DESC
    LIMIT 1
) t ON true;

-- Garantir permissões
GRANT SELECT ON public.queue_display TO anon;
GRANT SELECT ON public.queue_history TO anon;
GRANT SELECT ON public.reception_view TO anon;
GRANT EXECUTE ON FUNCTION translate_status(queue_status) TO anon;
GRANT EXECUTE ON FUNCTION translate_room(text) TO anon;

COMMIT; 