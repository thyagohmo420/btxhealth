-- Inserir setor de enfermagem se não existir
INSERT INTO sectors (name, description, type, capacity, manager, status, schedule, staff, active)
SELECT 'Enfermagem', 'Setor responsável pelos cuidados de enfermagem', 'nursing', 20, 'Coordenação de Enfermagem', 'active', '24h', 10, true
WHERE NOT EXISTS (
    SELECT 1 FROM sectors WHERE name = 'Enfermagem'
);

-- Criar função para verificar se um usuário é enfermeiro
CREATE OR REPLACE FUNCTION is_nurse(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM professionals p
        JOIN sectors s ON p.sector_id = s.id
        WHERE p.user_id = $1
        AND p.active = true
        AND s.name = 'Enfermagem'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 