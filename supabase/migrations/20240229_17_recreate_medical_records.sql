-- Fazer backup dos dados existentes
CREATE TEMP TABLE medical_records_backup AS SELECT * FROM medical_records;

-- Remover a tabela existente
DROP TABLE IF EXISTS medical_records CASCADE;

-- Recriar a tabela com a estrutura correta
CREATE TABLE medical_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    professional_id UUID REFERENCES professionals(id) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('consultation', 'return', 'exam', 'procedure')),
    notes TEXT NOT NULL,
    prescription TEXT,
    exam_request TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    record_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Restaurar os dados do backup (assumindo que são consultas)
INSERT INTO medical_records (
    id,
    patient_id,
    professional_id,
    type,
    notes,
    prescription,
    exam_request,
    attachments,
    status,
    record_date,
    created_at,
    updated_at
)
SELECT 
    id,
    patient_id,
    professional_id,
    'consultation' as type, -- Define todos registros antigos como consulta
    COALESCE(description, 'Sem observações') as notes,
    prescription,
    NULL as exam_request,
    COALESCE(
        CASE 
            WHEN attachments IS NULL THEN '[]'::jsonb
            ELSE to_jsonb(attachments)
        END,
        '[]'::jsonb
    ) as attachments,
    COALESCE(status, 'active'),
    COALESCE(record_date, created_at),
    created_at,
    updated_at
FROM medical_records_backup;

-- Remover a tabela de backup
DROP TABLE medical_records_backup;

-- Recriar a view
DROP VIEW IF EXISTS medical_records_view;
CREATE VIEW medical_records_view AS
SELECT 
    mr.*,
    p.full_name as patient_name,
    p.cpf as patient_cpf,
    prof.full_name as professional_name,
    prof.specialty as professional_specialty
FROM medical_records mr
JOIN patients p ON p.id = mr.patient_id
JOIN professionals prof ON prof.id = mr.professional_id;

-- Habilitar RLS
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Permitir leitura de prontuários para usuários autenticados"
ON medical_records FOR SELECT TO authenticated USING (true);

CREATE POLICY "Permitir inserção de prontuários para equipe médica"
ON medical_records FOR INSERT TO authenticated
WITH CHECK (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse']));

CREATE POLICY "Permitir atualização de prontuários para equipe médica"
ON medical_records FOR UPDATE TO authenticated
USING (auth.check_user_role(ARRAY['admin', 'doctor', 'nurse'])); 