-- Create sectors table
CREATE TABLE IF NOT EXISTS public.sectors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create professionals table
CREATE TABLE IF NOT EXISTS public.professionals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    full_name TEXT NOT NULL,
    registration_number TEXT,
    specialty TEXT,
    sector_id UUID REFERENCES public.sectors(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create vaccines table if not exists
CREATE TABLE IF NOT EXISTS public.vaccines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    batch TEXT NOT NULL,
    expiration_date DATE NOT NULL,
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create vaccine_records table if not exists
CREATE TABLE IF NOT EXISTS public.vaccine_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(id),
    vaccine_id UUID REFERENCES public.vaccines(id),
    dose_number INTEGER NOT NULL,
    application_date DATE NOT NULL,
    batch TEXT NOT NULL,
    applied_by UUID REFERENCES public.professionals(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    parameters JSONB,
    created_by UUID REFERENCES auth.users(id),
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccine_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create policies for sectors
CREATE POLICY "Enable read access for authenticated users" ON public.sectors
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for admin" ON public.sectors
    FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Enable update access for admin" ON public.sectors
    FOR UPDATE TO authenticated USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create policies for professionals
CREATE POLICY "Enable read access for authenticated users" ON public.professionals
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for admin" ON public.professionals
    FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Enable update access for admin" ON public.professionals
    FOR UPDATE TO authenticated USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create policies for vaccines
CREATE POLICY "Enable read access for authenticated users" ON public.vaccines
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for medical staff" ON public.vaccines
    FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'nurse'));

CREATE POLICY "Enable update access for medical staff" ON public.vaccines
    FOR UPDATE TO authenticated USING (auth.jwt() ->> 'role' IN ('admin', 'nurse'))
    WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'nurse'));

-- Create policies for vaccine_records
CREATE POLICY "Enable read access for authenticated users" ON public.vaccine_records
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for medical staff" ON public.vaccine_records
    FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'nurse'));

CREATE POLICY "Enable update access for medical staff" ON public.vaccine_records
    FOR UPDATE TO authenticated USING (auth.jwt() ->> 'role' IN ('admin', 'nurse'))
    WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'nurse'));

-- Create policies for reports
CREATE POLICY "Enable read access for authenticated users" ON public.reports
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.reports
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for owner" ON public.reports
    FOR UPDATE TO authenticated USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to all tables
CREATE TRIGGER set_sectors_updated_at
    BEFORE UPDATE ON public.sectors
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_professionals_updated_at
    BEFORE UPDATE ON public.professionals
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_vaccines_updated_at
    BEFORE UPDATE ON public.vaccines
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_vaccine_records_updated_at
    BEFORE UPDATE ON public.vaccine_records
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 