-- Criar tabela de atendimentos
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id),
    professional_id UUID NOT NULL REFERENCES professionals(id),
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'medium', 'high')),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    CONSTRAINT fk_professional FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE RESTRICT
);

-- Criar índices
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_professional ON appointments(professional_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_priority ON appointments(priority);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para updated_at
CREATE TRIGGER set_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_appointments_updated_at();

-- Habilitar RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "appointments_select_policy" ON appointments
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "appointments_insert_policy" ON appointments
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name IN ('admin', 'receptionist')
        )
    );

CREATE POLICY "appointments_update_policy" ON appointments
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.name IN ('admin', 'doctor', 'nurse')
        )
    );

-- Função para criar atendimento a partir da triagem
CREATE OR REPLACE FUNCTION create_appointment_from_triage()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO appointments (
        patient_id,
        professional_id,
        priority,
        notes
    ) VALUES (
        NEW.patient_id,
        NEW.professional_id,
        CASE 
            WHEN NEW.severity = 'emergency' THEN 'high'
            WHEN NEW.severity = 'urgent' THEN 'medium'
            ELSE 'low'
        END,
        NEW.notes
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar atendimento após triagem
DROP TRIGGER IF EXISTS create_appointment_after_triage ON triage;
CREATE TRIGGER create_appointment_after_triage
    AFTER INSERT ON triage
    FOR EACH ROW
    EXECUTE FUNCTION create_appointment_from_triage();

-- Garantir permissões
GRANT ALL ON appointments TO authenticated; 