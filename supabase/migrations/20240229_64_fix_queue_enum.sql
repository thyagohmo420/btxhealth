-- Primeiro, dropar a view que usa o enum
DROP VIEW IF EXISTS queue_display;

-- Dropar e recriar o enum com os valores corretos
DROP TYPE IF EXISTS queue_status CASCADE;
CREATE TYPE queue_status AS ENUM (
    'em_espera',
    'em_triagem',
    'em_atendimento',
    'concluido'
);

-- Recriar a view queue_display com os valores corretos do enum
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
        WHEN qt.status = 'em_espera' THEN 'Aguardando'
        WHEN qt.status = 'em_triagem' THEN 'Em Triagem'
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

-- Atualizar a coluna status na tabela queue_tickets para usar o valor padrão correto
ALTER TABLE queue_tickets 
ALTER COLUMN status SET DEFAULT 'em_espera';

-- Atualizar registros existentes que possam ter o valor antigo
UPDATE queue_tickets 
SET status = 'em_espera' 
WHERE status = 'aguardando';

COMMIT; 