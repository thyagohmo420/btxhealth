-- Drop views if they exist
DROP VIEW IF EXISTS queue_display;
DROP VIEW IF EXISTS queue_history;

-- Create queue display view
CREATE OR REPLACE VIEW queue_display AS
SELECT 
    qt.id,
    qt.ticket_number,
    qt.patient_name,
    qt.status,
    qt.priority,
    qt.current_sector,
    qt.room,
    qt.created_at,
    qt.called_at,
    CASE 
        WHEN qt.current_sector = 'triagem' THEN 'Triagem'
        WHEN qt.current_sector = 'consultorio_1' THEN 'Consultório 1'
        WHEN qt.current_sector = 'consultorio_2' THEN 'Consultório 2'
        ELSE qt.current_sector
    END as sector_name
FROM queue_tickets qt
WHERE qt.status IN ('waiting', 'called', 'in_service')
ORDER BY 
    CASE qt.status
        WHEN 'called' THEN 1
        WHEN 'in_service' THEN 2
        WHEN 'waiting' THEN 3
        ELSE 4
    END,
    CASE qt.priority
        WHEN 'emergency' THEN 1
        WHEN 'priority' THEN 2
        ELSE 3
    END,
    qt.created_at ASC;

-- Create queue history view
CREATE OR REPLACE VIEW queue_history AS
SELECT 
    qt.id,
    qt.ticket_number,
    qt.patient_name,
    qt.status,
    qt.priority,
    qt.current_sector,
    qt.room,
    qt.created_at,
    qt.called_at,
    qt.completed_at,
    qt.cancelled_at,
    CASE 
        WHEN qt.current_sector = 'triagem' THEN 'Triagem'
        WHEN qt.current_sector = 'consultorio_1' THEN 'Consultório 1'
        WHEN qt.current_sector = 'consultorio_2' THEN 'Consultório 2'
        ELSE qt.current_sector
    END as sector_name
FROM queue_tickets qt
WHERE qt.status IN ('completed', 'cancelled', 'forwarded')
ORDER BY 
    COALESCE(qt.completed_at, qt.cancelled_at, qt.forwarded_at) DESC;

-- Grant permissions
GRANT SELECT ON queue_display TO anon;
GRANT SELECT ON queue_history TO anon; 