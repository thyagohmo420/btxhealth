-- Verificar se a tabela existe e criar se não existir
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id),
    professional_id UUID NOT NULL REFERENCES professionals(id),
    description TEXT NOT NULL,
    attachments TEXT[],
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    record_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
    CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    CONSTRAINT fk_professional FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE RESTRICT,
    CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE RESTRICT
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_professional ON medical_records(professional_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_created_by ON medical_records(created_by);
CREATE INDEX IF NOT EXISTS idx_medical_records_status ON medical_records(status);

-- Criar ou atualizar a função de atualização do updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger se não existir
DROP TRIGGER IF EXISTS update_medical_records_updated_at ON medical_records;
CREATE TRIGGER update_medical_records_updated_at
    BEFORE UPDATE ON medical_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Criar políticas RLS
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Política de leitura
DROP POLICY IF EXISTS "medical_records_select_policy" ON medical_records;
CREATE POLICY "medical_records_select_policy" ON medical_records
    FOR SELECT TO authenticated
    USING (true);

-- Política de inserção
DROP POLICY IF EXISTS "medical_records_insert_policy" ON medical_records;
CREATE POLICY "medical_records_insert_policy" ON medical_records
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name IN ('admin', 'doctor', 'nurse')
        )
    );

-- Política de atualização
DROP POLICY IF EXISTS "medical_records_update_policy" ON medical_records;
CREATE POLICY "medical_records_update_policy" ON medical_records
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name IN ('admin', 'doctor', 'nurse')
        )
    );

-- Política de deleção (soft delete)
DROP POLICY IF EXISTS "medical_records_delete_policy" ON medical_records;
CREATE POLICY "medical_records_delete_policy" ON medical_records
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name = 'admin'
        )
    )
    WITH CHECK (NEW.status = 'deleted');

-- Criar bucket para anexos se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Política de storage para anexos
CREATE POLICY "attachments_policy" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'attachments')
    WITH CHECK (bucket_id = 'attachments');

-- Garantir permissões corretas
GRANT ALL ON medical_records TO authenticated;
GRANT USAGE ON SEQUENCE medical_records_id_seq TO authenticated; 