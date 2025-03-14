-- Criar views
CREATE OR REPLACE VIEW queue_display AS
SELECT 
    qt.id,
    qt.ticket_number,
    qt.patient_name,
    qt.service_type,
    qt.priority,
    qt.status,
    qt.current_sector,
    qt.next_sector,
    qt.room,
    qt.called_at,
    qt.vital_signs,
    qt.notes,
    qt.created_at,
    u.username as called_by_name
FROM queue_tickets qt
LEFT JOIN auth.users u ON qt.called_by = u.id
WHERE qt.status IN ('waiting', 'called', 'in_service')
ORDER BY 
    CASE qt.status
        WHEN 'called' THEN 1
        WHEN 'in_service' THEN 2
        WHEN 'waiting' THEN 3
    END,
    CASE qt.priority
        WHEN 'emergency' THEN 1
        WHEN 'priority' THEN 2
        ELSE 3
    END,
    qt.created_at ASC;

CREATE OR REPLACE VIEW queue_history AS
SELECT 
    qt.id,
    qt.ticket_number,
    qt.patient_id,
    qt.patient_name,
    qt.service_type,
    qt.priority,
    qt.status,
    qt.current_sector,
    qt.next_sector,
    qt.called_by,
    qt.called_at,
    qt.forwarded_by,
    qt.forwarded_at,
    qt.completed_by,
    qt.completed_at,
    qt.room,
    qt.notes,
    qt.vital_signs,
    qt.created_at,
    qt.updated_at,
    cb.username as called_by_name,
    fb.username as forwarded_by_name,
    cpb.username as completed_by_name
FROM queue_tickets qt
LEFT JOIN auth.users cb ON qt.called_by = cb.id
LEFT JOIN auth.users fb ON qt.forwarded_by = fb.id
LEFT JOIN auth.users cpb ON qt.completed_by = cpb.id
WHERE qt.status = 'completed'
ORDER BY qt.completed_at DESC; 