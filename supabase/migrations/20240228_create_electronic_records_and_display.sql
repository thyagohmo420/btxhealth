-- Tabela de prontuário eletrônico
CREATE TABLE IF NOT EXISTS public.electronic_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id),
    professional_id UUID NOT NULL REFERENCES auth.users(id),
    record_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    record_type TEXT NOT NULL, -- 'consultation', 'exam', 'prescription', etc
    description TEXT,
    vital_signs JSONB,
    diagnosis TEXT[],
    prescriptions JSONB[],
    exams JSONB[],
    attachments TEXT[],
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de displays/telões
CREATE TABLE IF NOT EXISTS public.display_panels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL, -- 'reception', 'triage', 'consultation'
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de chamadas no display
CREATE TABLE IF NOT EXISTS public.display_calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    panel_id UUID NOT NULL REFERENCES public.display_panels(id),
    patient_id UUID NOT NULL REFERENCES public.patients(id),
    professional_id UUID REFERENCES auth.users(id),
    room TEXT,
    priority TEXT DEFAULT 'normal',
    status TEXT DEFAULT 'waiting', -- 'waiting', 'called', 'in_service', 'completed'
    call_number TEXT NOT NULL,
    called_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_electronic_records_patient ON public.electronic_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_electronic_records_professional ON public.electronic_records(professional_id);
CREATE INDEX IF NOT EXISTS idx_display_calls_panel ON public.display_calls(panel_id);
CREATE INDEX IF NOT EXISTS idx_display_calls_patient ON public.display_calls(patient_id);
CREATE INDEX IF NOT EXISTS idx_display_calls_status ON public.display_calls(status);

-- Triggers para updated_at
CREATE TRIGGER set_updated_at_electronic_records
    BEFORE UPDATE ON public.electronic_records
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_display_panels
    BEFORE UPDATE ON public.display_panels
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_display_calls
    BEFORE UPDATE ON public.display_calls
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies
ALTER TABLE public.electronic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.display_panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.display_calls ENABLE ROW LEVEL SECURITY;

-- Policies para prontuário eletrônico
CREATE POLICY "Enable read access for authenticated users" ON public.electronic_records
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.electronic_records
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.electronic_records
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Policies para displays
CREATE POLICY "Enable read access for all on display_panels" ON public.display_panels
    FOR SELECT USING (true);

CREATE POLICY "Enable management for authenticated users" ON public.display_panels
    FOR ALL USING (auth.role() = 'authenticated');

-- Policies para chamadas no display
CREATE POLICY "Enable read access for all on display_calls" ON public.display_calls
    FOR SELECT USING (true);

CREATE POLICY "Enable management for authenticated users" ON public.display_calls
    FOR ALL USING (auth.role() = 'authenticated');

-- Função para gerar número de chamada
CREATE OR REPLACE FUNCTION generate_call_number()
RETURNS TEXT AS $$
DECLARE
    current_date_str TEXT;
    sequence_number INT;
    call_number TEXT;
BEGIN
    current_date_str := to_char(CURRENT_DATE, 'YYYYMMDD');
    
    -- Tenta obter o próximo número da sequência para o dia atual
    SELECT COALESCE(MAX(SUBSTRING(call_number FROM '\d+$')::INT), 0) + 1
    INTO sequence_number
    FROM public.display_calls
    WHERE call_number LIKE current_date_str || '%';
    
    -- Formata o número com zeros à esquerda
    call_number := current_date_str || '-' || LPAD(sequence_number::TEXT, 4, '0');
    
    RETURN call_number;
END;
$$ LANGUAGE plpgsql; 