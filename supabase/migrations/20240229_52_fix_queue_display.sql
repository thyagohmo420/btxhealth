-- Drop e recriar a view queue_display com created_at
DROP VIEW IF EXISTS public.queue_display;

CREATE VIEW public.queue_display AS
SELECT 
    t.id,
    t.ticket_number,
    p.full_name as patient_name,
    t.room,
    t.status,
    t.called_at,
    t.created_at,
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

-- Garantir permissões
GRANT SELECT ON public.queue_display TO anon;

COMMIT; 