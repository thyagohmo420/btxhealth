BEGIN;

-- Verificar todas as dependências da coluna status
SELECT DISTINCT dependent_ns.nspname as dependent_schema,
       dependent_view.relname as dependent_view
FROM pg_depend 
JOIN pg_rewrite ON pg_depend.objid = pg_rewrite.oid 
JOIN pg_class as dependent_view ON pg_rewrite.ev_class = dependent_view.oid 
JOIN pg_class as source_table ON pg_depend.refobjid = source_table.oid 
JOIN pg_attribute ON pg_depend.refobjid = pg_attribute.attrelid 
    AND pg_depend.refobjsubid = pg_attribute.attnum
JOIN pg_namespace dependent_ns ON dependent_view.relnamespace = dependent_ns.oid
JOIN pg_namespace source_ns ON source_table.relnamespace = source_ns.oid
WHERE source_ns.nspname = 'public'
  AND source_table.relname = 'queue_tickets'
  AND pg_attribute.attname = 'status';

-- Dropar todas as views que dependem da coluna status
DROP VIEW IF EXISTS public.queue_display CASCADE;
DROP VIEW IF EXISTS public.queue_history CASCADE;
DROP VIEW IF EXISTS public.reception_view CASCADE;
DROP VIEW IF EXISTS public.patient_details CASCADE;
DROP VIEW IF EXISTS public.patient_queue CASCADE;
DROP VIEW IF EXISTS public.triage_queue CASCADE;

-- Remover o valor default da coluna status
ALTER TABLE public.queue_tickets ALTER COLUMN status DROP DEFAULT;

-- Alterar o tipo da coluna status para text temporariamente
ALTER TABLE public.queue_tickets ALTER COLUMN status TYPE text;

-- Dropar o enum existente com CASCADE
DROP TYPE IF EXISTS public.queue_status CASCADE;

-- Criar o novo enum com os valores atualizados
CREATE TYPE public.queue_status AS ENUM (
    'em_espera',
    'triagem',
    'em_atendimento',
    'finalizado',
    'cancelado'
);

-- Atualizar os tickets existentes
UPDATE public.queue_tickets 
SET status = CASE 
    WHEN status = 'waiting' THEN 'em_espera'
    WHEN status = 'attending' THEN 'em_atendimento'
    ELSE status
END;

-- Alterar a coluna status de volta para o tipo enum
ALTER TABLE public.queue_tickets 
    ALTER COLUMN status TYPE public.queue_status 
    USING status::public.queue_status;

-- Definir o valor default da coluna status
ALTER TABLE public.queue_tickets ALTER COLUMN status SET DEFAULT 'em_espera';

-- Criar função para chamar o próximo ticket
CREATE OR REPLACE FUNCTION public.call_next_ticket(
    p_ticket_id uuid,
    p_new_status queue_status,
    p_room text DEFAULT NULL
) RETURNS void AS $$
BEGIN
    UPDATE public.queue_tickets
    SET status = p_new_status,
        room = COALESCE(p_room, room),
        called_at = CASE 
            WHEN p_new_status IN ('em_atendimento', 'triagem') THEN NOW()
            ELSE called_at
        END,
        completed_at = CASE 
            WHEN p_new_status = 'finalizado' THEN NOW()
            ELSE completed_at
        END,
        cancelled_at = CASE 
            WHEN p_new_status = 'cancelado' THEN NOW()
            ELSE cancelled_at
        END
    WHERE id = p_ticket_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar as views principais com nomes temporários
CREATE VIEW public.queue_display_new AS
SELECT 
    qt.id,
    qt.ticket_number,
    qt.patient_name,
    qt.status,
    qt.priority,
    qt.room,
    qt.called_at,
    qt.created_at
FROM queue_tickets qt
WHERE qt.status IN ('em_espera', 'em_atendimento', 'triagem')
AND DATE(qt.created_at) = CURRENT_DATE
ORDER BY 
    CASE qt.priority
        WHEN 'emergency' THEN 1
        WHEN 'priority' THEN 2
        ELSE 3
    END,
    qt.created_at;

CREATE VIEW public.queue_history_new AS
SELECT 
    qt.id,
    qt.ticket_number,
    qt.patient_name,
    qt.status,
    qt.priority,
    qt.room,
    qt.called_at,
    qt.completed_at,
    qt.cancelled_at,
    qt.created_at
FROM queue_tickets qt
WHERE qt.status IN ('finalizado', 'cancelado')
ORDER BY COALESCE(qt.completed_at, qt.cancelled_at) DESC;

CREATE VIEW public.reception_view_new AS
SELECT 
    p.id,
    p.full_name,
    p.cpf,
    p.birth_date,
    p.sus_card,
    p.phone,
    p.city,
    COALESCE(pf.printed_at IS NOT NULL, false) as form_printed,
    qt.status as ticket_status,
    qt.ticket_number,
    p.created_at
FROM patients p
LEFT JOIN patient_forms pf ON p.id = pf.patient_id
LEFT JOIN queue_tickets qt ON p.id = qt.patient_id
WHERE DATE(p.created_at) = CURRENT_DATE
ORDER BY p.created_at DESC;

-- Renomear as views temporárias para seus nomes finais
ALTER VIEW public.queue_display_new RENAME TO queue_display;
ALTER VIEW public.queue_history_new RENAME TO queue_history;
ALTER VIEW public.reception_view_new RENAME TO reception_view;

-- Garantir permissões para as views
GRANT SELECT ON public.queue_display TO anon;
GRANT SELECT ON public.queue_history TO anon;
GRANT SELECT ON public.reception_view TO anon;

-- Garantir permissões para a função
GRANT EXECUTE ON FUNCTION public.call_next_ticket(uuid, queue_status, text) TO anon;

COMMIT; 