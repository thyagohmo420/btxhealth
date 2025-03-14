-- Drop existing function if exists
DROP FUNCTION IF EXISTS public.generate_patient_ticket_and_print(uuid, text);

-- Create new function with corrected logic
CREATE OR REPLACE FUNCTION public.generate_patient_ticket_and_print(
    p_patient_id uuid,
    p_priority text DEFAULT 'normal'
)
RETURNS TABLE (
    id uuid,
    ticket_number text,
    patient_name text,
    priority text,
    status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_active_ticket record;
    v_ticket_count integer;
    v_new_ticket record;
BEGIN
    -- Check if patient already has an active ticket
    SELECT qt.* INTO v_active_ticket
    FROM queue_tickets qt
    WHERE qt.patient_id = p_patient_id
    AND qt.created_at::date = CURRENT_DATE
    AND qt.status != 'concluido';

    IF v_active_ticket.id IS NOT NULL THEN
        RAISE EXCEPTION 'Paciente já possui uma senha ativa hoje: %', v_active_ticket.ticket_number;
    END IF;

    -- Get count of tickets for today
    SELECT COUNT(*) + 1 INTO v_ticket_count
    FROM queue_tickets qt
    WHERE qt.created_at::date = CURRENT_DATE;

    -- Insert new ticket
    INSERT INTO queue_tickets (
        patient_id,
        ticket_number,
        priority,
        status,
        created_at
    )
    VALUES (
        p_patient_id,
        CASE p_priority
            WHEN 'emergency' THEN 'E'
            WHEN 'priority' THEN 'P'
            ELSE 'N'
        END || LPAD(v_ticket_count::text, 3, '0'),
        p_priority::ticket_priority,
        'em_espera'::queue_status,
        NOW()
    )
    RETURNING * INTO v_new_ticket;

    -- Return ticket info
    RETURN QUERY
    SELECT 
        qt.id,
        qt.ticket_number,
        p.full_name,
        qt.priority::text,
        qt.status::text
    FROM queue_tickets qt
    JOIN patients p ON p.id = qt.patient_id
    WHERE qt.id = v_new_ticket.id;
END;
$function$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.generate_patient_ticket_and_print(uuid, text) TO anon;

-- Recreate trigger function for realtime
CREATE OR REPLACE FUNCTION public.handle_new_ticket()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'new_ticket',
    json_build_object(
      'ticket_id', NEW.id,
      'ticket_number', NEW.ticket_number,
      'priority', NEW.priority,
      'status', NEW.status
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS tickets_trigger ON queue_tickets;
CREATE TRIGGER tickets_trigger
  AFTER INSERT ON queue_tickets
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_ticket();

COMMIT; 