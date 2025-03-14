-- Criar a tabela de regulação ambulatorial
CREATE TABLE IF NOT EXISTS public.ambulatory_regulation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id),
    professional_id UUID NOT NULL REFERENCES public.professionals(id),
    specialty TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('emergency', 'urgent', 'high', 'normal', 'low')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    notes TEXT NOT NULL,
    attachments TEXT[] DEFAULT '{}',
    request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by UUID REFERENCES public.professionals(id),
    approval_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar a view que junta as informações necessárias
CREATE OR REPLACE VIEW public.ambulatory_regulation_view AS
SELECT 
    ar.id,
    p.full_name as patient_name,
    p.cpf as patient_cpf,
    p.birth_date as patient_birth_date,
    ar.specialty,
    ar.priority,
    ar.status,
    prof.full_name as professional_name,
    ar.request_date,
    ar.notes,
    ar.attachments,
    aprof.full_name as approved_by_name,
    ar.approval_date
FROM 
    public.ambulatory_regulation ar
    JOIN public.patients p ON p.id = ar.patient_id
    JOIN public.professionals prof ON prof.id = ar.professional_id
    LEFT JOIN public.professionals aprof ON aprof.id = ar.approved_by;

-- Adicionar políticas de segurança
ALTER TABLE public.ambulatory_regulation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura para usuários autenticados"
    ON public.ambulatory_regulation
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Permitir inserção para usuários autenticados"
    ON public.ambulatory_regulation
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Permitir atualização para usuários autenticados"
    ON public.ambulatory_regulation
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Trigger para atualizar o updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ambulatory_regulation_updated_at
    BEFORE UPDATE ON public.ambulatory_regulation
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column(); 