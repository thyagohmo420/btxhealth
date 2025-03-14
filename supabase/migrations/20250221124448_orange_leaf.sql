/*
  # Health Management System Schema

  1. New Tables
    - `exams`: Available medical exams
    - `exam_results`: Exam results and reports
    - `medical_records`: Electronic health records
    - `medications`: Medication catalog
    - `treatments`: Treatment tracking
    - `health_insurance`: Insurance providers and plans

  2. Security
    - RLS enabled on all tables
    - Access policies by role
    - GDPR compliance measures
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_name text NOT NULL,
  exam_type text NOT NULL,
  description text,
  preparation text,
  duration interval,
  price decimal(10,2),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exam_results (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id uuid REFERENCES exams(id),
  patient_id uuid REFERENCES patients(id),
  professional_id uuid REFERENCES users(id),
  request_date timestamptz NOT NULL,
  collection_date timestamptz,
  result_date timestamptz,
  status text NOT NULL,
  result jsonb,
  attachments jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid REFERENCES patients(id),
  professional_id uuid REFERENCES users(id),
  record_type text NOT NULL,
  record_date timestamptz NOT NULL,
  description text NOT NULL,
  diagnosis text,
  procedures text[],
  attachments jsonb,
  private_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_name text NOT NULL,
  active_ingredient text NOT NULL,
  concentration text,
  form text NOT NULL,
  manufacturer text,
  controlled boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS treatments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid REFERENCES patients(id),
  professional_id uuid REFERENCES users(id),
  condition text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  status text NOT NULL,
  treatment_plan text,
  progress_notes jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS health_insurance (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  insurance_name text NOT NULL,
  provider text NOT NULL,
  plan_type text NOT NULL,
  coverage jsonb,
  active boolean DEFAULT true,
  contact_info jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_insurance ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Exams
CREATE POLICY "Exams viewable by authenticated users"
  ON exams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Exams manageable by staff"
  ON exams FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'doctor', 'lab_tech'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'doctor', 'lab_tech'));

-- Exam Results
CREATE POLICY "Exam results viewable by involved parties"
  ON exam_results FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'doctor', 'lab_tech')
    OR patient_id = auth.uid()
    OR professional_id = auth.uid()
  );

CREATE POLICY "Exam results manageable by staff"
  ON exam_results FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'doctor', 'lab_tech'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'doctor', 'lab_tech'));

-- Medical Records
CREATE POLICY "Medical records viewable by involved parties"
  ON medical_records FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'doctor', 'nurse')
    OR patient_id = auth.uid()
    OR professional_id = auth.uid()
  );

CREATE POLICY "Medical records manageable by medical staff"
  ON medical_records FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'doctor', 'nurse'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'doctor', 'nurse'));

-- Medications
CREATE POLICY "Medications viewable by authenticated users"
  ON medications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Medications manageable by staff"
  ON medications FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'doctor', 'pharmacist'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'doctor', 'pharmacist'));

-- Treatments
CREATE POLICY "Treatments viewable by involved parties"
  ON treatments FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'doctor', 'nurse')
    OR patient_id = auth.uid()
    OR professional_id = auth.uid()
  );

CREATE POLICY "Treatments manageable by medical staff"
  ON treatments FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'doctor'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'doctor'));

-- Health Insurance
CREATE POLICY "Health insurance viewable by authenticated users"
  ON health_insurance FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Health insurance manageable by admin"
  ON health_insurance FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_exams_exam_name ON exams(exam_name);
CREATE INDEX IF NOT EXISTS idx_exams_exam_type ON exams(exam_type);
CREATE INDEX IF NOT EXISTS idx_exam_results_patient ON exam_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_status ON exam_results(status);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_date ON medical_records(record_date);
CREATE INDEX IF NOT EXISTS idx_medications_name ON medications(medication_name);
CREATE INDEX IF NOT EXISTS idx_treatments_patient ON treatments(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatments_status ON treatments(status);
CREATE INDEX IF NOT EXISTS idx_health_insurance_name ON health_insurance(insurance_name);

-- Create Triggers
CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON exams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exam_results_updated_at
  BEFORE UPDATE ON exam_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatments_updated_at
  BEFORE UPDATE ON treatments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_insurance_updated_at
  BEFORE UPDATE ON health_insurance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();