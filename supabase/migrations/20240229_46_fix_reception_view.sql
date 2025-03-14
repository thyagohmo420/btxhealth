BEGIN;

-- Criar uma nova versão da reception_view
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
LEFT JOIN LATERAL (
    SELECT patient_id, printed_at 
    FROM patient_forms 
    WHERE patient_id = p.id 
    ORDER BY printed_at DESC 
    LIMIT 1
) pf ON true
LEFT JOIN LATERAL (
    SELECT 
        id,
        patient_id,
        status,
        ticket_number
    FROM queue_tickets 
    WHERE patient_id = p.id 
    AND DATE(created_at) = CURRENT_DATE
    ORDER BY created_at DESC 
    LIMIT 1
) qt ON true
WHERE 
    -- Mostrar pacientes que não têm ficha impressa
    (pf.printed_at IS NULL)
    OR 
    -- Ou pacientes que têm ficha impressa mas não têm senha hoje ou têm senha em espera/triagem
    (pf.printed_at IS NOT NULL AND (
        qt.id IS NULL OR 
        qt.status IN ('em_espera', 'triagem')
    ))
ORDER BY 
    -- Priorizar pacientes sem ficha impressa
    CASE WHEN pf.printed_at IS NULL THEN 0 ELSE 1 END,
    -- Depois por data de criação (mais recentes primeiro)
    p.created_at DESC;

-- Dropar a view antiga e renomear a nova
DROP VIEW IF EXISTS public.reception_view CASCADE;
ALTER VIEW public.reception_view_new RENAME TO reception_view;

-- Garantir permissões
GRANT SELECT ON public.reception_view TO anon;

COMMIT; 