-- Criar tabela temporária com os registros únicos de enfermeiros
WITH EnfermeirosUnicos AS (
  SELECT DISTINCT ON (p.user_id) 
    p.id,
    p.user_id,
    p.active
  FROM professionals p
  JOIN sectors s ON p.sector_id = s.id
  WHERE s.name = 'Enfermagem'
  ORDER BY p.user_id, p.created_at DESC
)
-- Desativar os registros duplicados
UPDATE professionals p
SET active = false
WHERE p.id NOT IN (
  SELECT id FROM EnfermeirosUnicos
)
AND EXISTS (
  SELECT 1 
  FROM sectors s 
  WHERE s.id = p.sector_id 
  AND s.name = 'Enfermagem'
); 