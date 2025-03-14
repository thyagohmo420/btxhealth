-- Adicionar coluna status à tabela queue_tickets
ALTER TABLE queue_tickets
ADD COLUMN IF NOT EXISTS status queue_status DEFAULT 'aguardando';

-- Recriar a view queue_display
DROP VIEW IF EXISTS queue_display;
CREATE VIEW queue_display AS
SELECT 
    qt.id,
    qt.ticket_number,
    p.full_name as patient_name,
    qt.room,
    CASE 
        WHEN qt.room LIKE 'TRIAGEM%' THEN 'Triagem'
        WHEN qt.room LIKE 'CONSULTORIO%' THEN 'Consultório'
        ELSE qt.room
    END AS room_display,
    qt.status::text,
    CASE 
        WHEN qt.status = 'aguardando' THEN 'Aguardando'
        WHEN qt.status = 'triagem' THEN 'Em Triagem'
        WHEN qt.status = 'em_atendimento' THEN 'Em Atendimento'
        WHEN qt.status = 'concluido' THEN 'Concluído'
    END AS status_display,
    qt.priority,
    qt.called_at,
    qt.created_at
FROM queue_tickets qt
JOIN patients p ON p.id = qt.patient_id
WHERE qt.created_at::date = CURRENT_DATE
ORDER BY 
    CASE qt.priority
        WHEN 'emergency' THEN 1
        WHEN 'priority' THEN 2
        ELSE 3
    END,
    qt.created_at;

COMMIT; 