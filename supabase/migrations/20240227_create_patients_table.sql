-- Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    cpf TEXT UNIQUE CHECK (cpf ~ '^\d{11}$'),
    rg TEXT,
    sus_card TEXT UNIQUE,
    birth_date DATE,
    phone TEXT,
    email TEXT,
    address JSONB,
    emergency_contact JSONB,
    priority TEXT DEFAULT 'normal',
    symptoms TEXT[],
    allergies TEXT[],
    medications TEXT[],
    health_insurance TEXT,
    last_visit TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'waiting',
    estimated_wait_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for search
CREATE INDEX IF NOT EXISTS patients_full_name_idx ON public.patients USING GIN (to_tsvector('portuguese', full_name));
CREATE INDEX IF NOT EXISTS patients_cpf_idx ON public.patients (cpf);
CREATE INDEX IF NOT EXISTS patients_sus_card_idx ON public.patients (sus_card);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.patients;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create RLS policies
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Policy for select
CREATE POLICY "Enable read access for authenticated users" ON public.patients
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Policy for insert
CREATE POLICY "Enable insert access for authenticated users" ON public.patients
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Policy for update
CREATE POLICY "Enable update access for authenticated users" ON public.patients
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Policy for delete
CREATE POLICY "Enable delete access for authenticated users" ON public.patients
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- Comments
COMMENT ON TABLE public.patients IS 'Tabela de pacientes do sistema';
COMMENT ON COLUMN public.patients.id IS 'ID único do paciente';
COMMENT ON COLUMN public.patients.full_name IS 'Nome completo do paciente';
COMMENT ON COLUMN public.patients.cpf IS 'CPF do paciente';
COMMENT ON COLUMN public.patients.rg IS 'RG do paciente';
COMMENT ON COLUMN public.patients.sus_card IS 'Número do cartão SUS';
COMMENT ON COLUMN public.patients.birth_date IS 'Data de nascimento';
COMMENT ON COLUMN public.patients.phone IS 'Telefone de contato';
COMMENT ON COLUMN public.patients.email IS 'E-mail do paciente';
COMMENT ON COLUMN public.patients.address IS 'Endereço completo em formato JSON';
COMMENT ON COLUMN public.patients.emergency_contact IS 'Contato de emergência em formato JSON';
COMMENT ON COLUMN public.patients.priority IS 'Prioridade de atendimento (normal, urgent, emergency)';
COMMENT ON COLUMN public.patients.symptoms IS 'Lista de sintomas';
COMMENT ON COLUMN public.patients.allergies IS 'Lista de alergias';
COMMENT ON COLUMN public.patients.medications IS 'Lista de medicamentos em uso';
COMMENT ON COLUMN public.patients.health_insurance IS 'Plano de saúde';
COMMENT ON COLUMN public.patients.last_visit IS 'Data da última visita';
COMMENT ON COLUMN public.patients.status IS 'Status do paciente na fila';
COMMENT ON COLUMN public.patients.estimated_wait_time IS 'Tempo estimado de espera em minutos';
COMMENT ON COLUMN public.patients.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN public.patients.updated_at IS 'Data da última atualização'; 