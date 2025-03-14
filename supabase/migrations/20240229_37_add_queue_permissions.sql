-- Remover políticas existentes
DROP POLICY IF EXISTS "Permitir select anônimo em queue_tickets" ON queue_tickets;
DROP POLICY IF EXISTS "Permitir insert anônimo em queue_tickets" ON queue_tickets;
DROP POLICY IF EXISTS "Permitir update anônimo em queue_tickets" ON queue_tickets;

-- Habilitar RLS
ALTER TABLE queue_tickets ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso para usuários anônimos
CREATE POLICY "Permitir select anônimo em queue_tickets"
ON queue_tickets FOR SELECT
TO anon
USING (true);

CREATE POLICY "Permitir insert anônimo em queue_tickets"
ON queue_tickets FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Permitir update anônimo em queue_tickets"
ON queue_tickets FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- Garantir acesso às funções para usuários anônimos
GRANT EXECUTE ON FUNCTION generate_ticket_number(text) TO anon;
GRANT EXECUTE ON FUNCTION call_next_ticket(text, text) TO anon;
GRANT EXECUTE ON FUNCTION forward_patient(uuid, text, text) TO anon;
GRANT EXECUTE ON FUNCTION complete_ticket(uuid) TO anon;
GRANT EXECUTE ON FUNCTION cancel_ticket(uuid) TO anon;

-- Garantir acesso à tabela queue_tickets
GRANT ALL ON queue_tickets TO anon;
GRANT USAGE ON SCHEMA public TO anon; 