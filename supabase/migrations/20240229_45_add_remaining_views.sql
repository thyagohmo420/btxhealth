BEGIN;

-- Criar views com nomes temporários
CREATE VIEW public.patient_details_new AS
SELECT 
    p.id,
    p.full_name,
    p.cpf,
    p.birth_date,
    p.sus_card,
    p.phone,
    p.city,
    qt.ticket_number,
    qt.status as ticket_status,
    qt.priority as ticket_priority,
    qt.called_at,
    qt.completed_at,
    qt.room
FROM patients p
LEFT JOIN queue_tickets qt ON p.id = qt.patient_id
WHERE qt.id IS NULL OR DATE(qt.created_at) = CURRENT_DATE;

CREATE VIEW public.patient_queue_new AS
SELECT 
    p.id,
    p.full_name,
    p.cpf,
    p.birth_date,
    p.sus_card,
    p.phone,
    p.city,
    qt.id as ticket_id,
    qt.ticket_number,
    qt.status as ticket_status,
    qt.priority as ticket_priority,
    qt.called_at,
    qt.completed_at,
    qt.room
FROM patients p
JOIN queue_tickets qt ON p.id = qt.patient_id
WHERE DATE(qt.created_at) = CURRENT_DATE;

CREATE VIEW public.triage_queue_new AS
SELECT 
    p.id,
    p.full_name,
    p.cpf,
    p.birth_date,
    p.sus_card,
    p.phone,
    p.city,
    qt.id as ticket_id,
    qt.ticket_number,
    qt.status as ticket_status,
    qt.priority as ticket_priority,
    qt.called_at,
    qt.completed_at,
    qt.room
FROM patients p
JOIN queue_tickets qt ON p.id = qt.patient_id
WHERE qt.status = 'triagem'
AND DATE(qt.created_at) = CURRENT_DATE;

-- Renomear as views temporárias para seus nomes finais
ALTER VIEW public.patient_details_new RENAME TO patient_details;
ALTER VIEW public.patient_queue_new RENAME TO patient_queue;
ALTER VIEW public.triage_queue_new RENAME TO triage_queue;

-- Garantir permissões para as views
GRANT SELECT ON public.patient_details TO anon;
GRANT SELECT ON public.patient_queue TO anon;
GRANT SELECT ON public.triage_queue TO anon;

COMMIT; 