-- Criar schema auth se não existir
CREATE SCHEMA IF NOT EXISTS auth;

-- Remover função existente se existir
DROP FUNCTION IF EXISTS auth.check_user_role(text[]); 