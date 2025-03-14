-- Função para garantir apenas um profissional ativo por usuário
CREATE OR REPLACE FUNCTION ensure_single_active_professional()
RETURNS TRIGGER AS $$
BEGIN
    -- Se estamos ativando um profissional
    IF NEW.active = true THEN
        -- Desativar outros profissionais do mesmo usuário
        UPDATE professionals
        SET active = false
        WHERE user_id = NEW.user_id
        AND id != NEW.id
        AND active = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger
DROP TRIGGER IF EXISTS ensure_single_active_professional_trigger ON professionals;
CREATE TRIGGER ensure_single_active_professional_trigger
    BEFORE INSERT OR UPDATE OF active ON professionals
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_active_professional();

-- Limpar registros duplicados existentes
WITH ranked_professionals AS (
    SELECT 
        id,
        user_id,
        active,
        created_at,
        ROW_NUMBER() OVER (
            PARTITION BY user_id 
            ORDER BY created_at DESC
        ) as rn
    FROM professionals
    WHERE active = true
)
UPDATE professionals
SET active = false
WHERE id IN (
    SELECT id 
    FROM ranked_professionals 
    WHERE rn > 1
); 