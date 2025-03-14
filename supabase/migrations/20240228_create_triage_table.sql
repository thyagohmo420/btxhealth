-- Create triage table
CREATE TABLE IF NOT EXISTS public.triage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id),
    symptoms TEXT[],
    medications TEXT[],
    allergies TEXT[],
    vital_signs JSONB NOT NULL,
    priority TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_triage_patient_id ON public.triage(patient_id);
CREATE INDEX IF NOT EXISTS idx_triage_status ON public.triage(status);
CREATE INDEX IF NOT EXISTS idx_triage_priority ON public.triage(priority);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.handle_triage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_triage_updated_at ON public.triage;
CREATE TRIGGER set_triage_updated_at
    BEFORE UPDATE ON public.triage
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_triage_updated_at();

-- Enable RLS
ALTER TABLE public.triage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for authenticated users" ON public.triage
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for medical staff" ON public.triage
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'doctor', 'nurse'));

CREATE POLICY "Enable update access for medical staff" ON public.triage
    FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'doctor', 'nurse'))
    WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'doctor', 'nurse'));

CREATE POLICY "Enable delete access for admin" ON public.triage
    FOR DELETE
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin'); 