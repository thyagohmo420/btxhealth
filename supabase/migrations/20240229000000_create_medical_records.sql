-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  gender TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  rg TEXT NOT NULL,
  marital_status TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  cep TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  allergies TEXT[],
  blood_type TEXT,
  emergency_contact JSONB
);

-- Create medical_records table
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  symptoms TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  prescriptions JSONB NOT NULL DEFAULT '[]'::jsonb,
  exams JSONB NOT NULL DEFAULT '[]'::jsonb,
  doctor TEXT NOT NULL,
  requires_hospitalization BOOLEAN NOT NULL DEFAULT false,
  hospitalization_details JSONB,
  vital_signs JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create vital_signs table
CREATE TABLE IF NOT EXISTS vital_signs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  temperature NUMERIC,
  blood_pressure JSONB NOT NULL,
  heart_rate INTEGER NOT NULL,
  respiratory_rate INTEGER NOT NULL,
  oxygen_saturation INTEGER NOT NULL,
  pain_level INTEGER,
  glucose_level INTEGER,
  weight NUMERIC,
  height NUMERIC,
  bmi NUMERIC,
  measured_at TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;

-- Policies for patients
CREATE POLICY "Users can view their own patients"
  ON patients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own patients"
  ON patients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patients"
  ON patients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own patients"
  ON patients FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for medical_records
CREATE POLICY "Users can view medical records of their patients"
  ON medical_records FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = medical_records.patient_id
    AND patients.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert medical records for their patients"
  ON medical_records FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = medical_records.patient_id
    AND patients.user_id = auth.uid()
  ));

CREATE POLICY "Users can update medical records of their patients"
  ON medical_records FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = medical_records.patient_id
    AND patients.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete medical records of their patients"
  ON medical_records FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = medical_records.patient_id
    AND patients.user_id = auth.uid()
  ));

-- Policies for vital_signs
CREATE POLICY "Users can view vital signs of their patients"
  ON vital_signs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = vital_signs.patient_id
    AND patients.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert vital signs for their patients"
  ON vital_signs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = vital_signs.patient_id
    AND patients.user_id = auth.uid()
  ));

CREATE POLICY "Users can update vital signs of their patients"
  ON vital_signs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = vital_signs.patient_id
    AND patients.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete vital signs of their patients"
  ON vital_signs FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM patients
    WHERE patients.id = vital_signs.patient_id
    AND patients.user_id = auth.uid()
  )); 