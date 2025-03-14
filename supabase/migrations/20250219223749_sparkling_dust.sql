/*
  # Reception System Database Schema

  1. New Tables
    - `users` - System users and authentication
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `full_name` (text)
      - `role` (text)
      - `sector` (text)
      - `active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `patients` - Patient information
      - `id` (uuid, primary key)
      - `full_name` (text)
      - `cpf` (text, unique)
      - `rg` (text)
      - `sus_card` (text)
      - `birth_date` (date)
      - `phone` (text)
      - `email` (text)
      - `address` (jsonb)
      - `emergency_contact` (jsonb)
      - `priority` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `appointments` - Scheduled appointments
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key)
      - `professional_id` (uuid, foreign key)
      - `date` (date)
      - `time` (time)
      - `type` (text)
      - `status` (text)
      - `notes` (text)
      - `created_by` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `queue` - Waiting queue
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key)
      - `sector` (text)
      - `priority` (text)
      - `status` (text)
      - `arrival_time` (timestamp)
      - `service_start` (timestamp)
      - `service_end` (timestamp)
      - `notes` (text)
      - `created_by` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `service_history` - Service history records
      - `id` (uuid, primary key)
      - `patient_id` (uuid, foreign key)
      - `professional_id` (uuid, foreign key)
      - `service_type` (text)
      - `sector` (text)
      - `start_time` (timestamp)
      - `end_time` (timestamp)
      - `notes` (text)
      - `created_by` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `notifications` - System notifications
      - `id` (uuid, primary key)
      - `type` (text)
      - `title` (text)
      - `message` (text)
      - `recipient_id` (uuid, foreign key)
      - `read` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `activity_logs` - System activity logs
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `action` (text)
      - `entity_type` (text)
      - `entity_id` (uuid)
      - `details` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on their roles
    - Ensure data privacy and access control

  3. Indexes
    - Add indexes for frequently queried columns
    - Optimize search and filtering operations
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL,
  sector text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Patients table
CREATE TABLE patients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name text NOT NULL,
  cpf text UNIQUE,
  rg text,
  sus_card text,
  birth_date date,
  phone text,
  email text,
  address jsonb,
  emergency_contact jsonb,
  priority text DEFAULT 'normal',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Appointments table
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid REFERENCES patients(id),
  professional_id uuid REFERENCES users(id),
  date date NOT NULL,
  time time NOT NULL,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  notes text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Queue table
CREATE TABLE queue (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid REFERENCES patients(id),
  sector text NOT NULL,
  priority text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'waiting',
  arrival_time timestamptz NOT NULL DEFAULT now(),
  service_start timestamptz,
  service_end timestamptz,
  notes text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Service history table
CREATE TABLE service_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id uuid REFERENCES patients(id),
  professional_id uuid REFERENCES users(id),
  service_type text NOT NULL,
  sector text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  notes text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  recipient_id uuid REFERENCES users(id),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activity logs table
CREATE TABLE activity_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_patients_full_name ON patients(full_name);
CREATE INDEX idx_patients_cpf ON patients(cpf);
CREATE INDEX idx_patients_sus_card ON patients(sus_card);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_queue_status ON queue(status);
CREATE INDEX idx_queue_sector ON queue(sector);
CREATE INDEX idx_service_history_patient_id ON service_history(patient_id);
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity_id ON activity_logs(entity_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Reception staff can view all patients"
  ON patients
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'reception', 'doctor', 'nurse'));

CREATE POLICY "Reception staff can create patients"
  ON patients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'reception'));

CREATE POLICY "Reception staff can update patients"
  ON patients
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'reception'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'reception'));

CREATE POLICY "Staff can view appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'reception', 'doctor', 'nurse'));

CREATE POLICY "Reception staff can manage appointments"
  ON appointments
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'reception'));

CREATE POLICY "Staff can view queue"
  ON queue
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'reception', 'doctor', 'nurse'));

CREATE POLICY "Reception staff can manage queue"
  ON queue
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'reception'));

CREATE POLICY "Staff can view service history"
  ON service_history
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'reception', 'doctor', 'nurse'));

CREATE POLICY "Staff can create service history"
  ON service_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'reception', 'doctor', 'nurse'));

CREATE POLICY "Users can view their notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_id);

CREATE POLICY "Staff can view activity logs"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin'));

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_queue_updated_at
  BEFORE UPDATE ON queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_history_updated_at
  BEFORE UPDATE ON service_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();