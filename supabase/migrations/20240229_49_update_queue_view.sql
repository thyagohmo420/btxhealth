-- Drop existing view
DROP VIEW IF EXISTS public.queue_display;

-- Create new view with all necessary information
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
    CASE 
        WHEN t.status = 'em_espera' THEN 'Aguardando'
        WHEN t.status = 'triagem' THEN 'Em Triagem'
        WHEN t.status = 'em_atendimento' THEN 'Em Atendimento'
        WHEN t.status = 'concluido' THEN 'Concluído'
        ELSE t.status
    END as status_display,
    CASE 
        WHEN t.room = 'TRIAGEM_01' THEN 'Triagem 01'
        WHEN t.room = 'ATENDIMENTO_01' THEN 'Atendimento Médico 01'
        WHEN t.room = 'ATENDIMENTO_02' THEN 'Atendimento Médico 02'
        ELSE t.room
    END as room_display
FROM queue_tickets t
JOIN patients p ON p.id = t.patient_id
WHERE DATE(t.created_at) = CURRENT_DATE
ORDER BY 
    CASE t.status
        WHEN 'em_espera' THEN 1
        WHEN 'triagem' THEN 2
        WHEN 'em_atendimento' THEN 3
        ELSE 4
    END,
    t.created_at DESC;

-- Grant permissions
GRANT SELECT ON public.queue_display TO anon;

COMMIT; 