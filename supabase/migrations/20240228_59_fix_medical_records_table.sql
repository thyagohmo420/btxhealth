-- Remover a tabela se existir para recriar corretamente
DROP TABLE IF EXISTS medical_records CASCADE;

-- Criar a tabela medical_records
CREATE TABLE medical_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL,
    professional_id UUID NOT NULL,
    description TEXT NOT NULL,
    attachments TEXT[],
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    record_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    CONSTRAINT medical_records_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    CONSTRAINT medical_records_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE RESTRICT,
    CONSTRAINT medical_records_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE RESTRICT,
    CONSTRAINT medical_records_status_check CHECK (status IN ('active', 'inactive', 'deleted'))
);

-- Criar índices
CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX idx_medical_records_professional ON medical_records(professional_id);
CREATE INDEX idx_medical_records_created_by ON medical_records(created_by);
CREATE INDEX idx_medical_records_status ON medical_records(status);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_medical_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para updated_at
CREATE TRIGGER set_medical_records_updated_at
    BEFORE UPDATE ON medical_records
    FOR EACH ROW
    EXECUTE FUNCTION update_medical_records_updated_at();

-- Habilitar RLS
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "medical_records_select_policy" ON medical_records
    FOR SELECT TO authenticated
    USING (true);

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

-- Criar bucket para anexos se não existir
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('attachments', 'attachments', true)
    ON CONFLICT (id) DO NOTHING;
EXCEPTION
    WHEN undefined_table THEN
        -- Ignora se a tabela storage.buckets não existir
        NULL;
END $$;

-- Política de storage para anexos
DROP POLICY IF EXISTS "attachments_policy" ON storage.objects;
CREATE POLICY "attachments_policy" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'attachments')
    WITH CHECK (bucket_id = 'attachments');

-- Garantir permissões
GRANT ALL ON medical_records TO authenticated; 