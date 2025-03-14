-- Remover funções existentes
DROP FUNCTION IF EXISTS public.generate_patient_ticket_and_print(uuid, text);
DROP FUNCTION IF EXISTS public.call_next_ticket(text, uuid);

COMMIT; 