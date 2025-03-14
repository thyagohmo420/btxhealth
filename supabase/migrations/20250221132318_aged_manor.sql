/*
  # Fix RLS policies for patients table

  1. Changes
    - Drop existing policies
    - Create new policies with proper role checks
    - Add policies for all CRUD operations
    
  2. Security
    - Ensure proper role-based access
    - Add policies for reception staff
    - Add policies for medical staff
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Patients are viewable by authenticated users" ON patients;
DROP POLICY IF EXISTS "Patients are insertable by staff" ON patients;
DROP POLICY IF EXISTS "Patients are updatable by staff" ON patients;

-- Create new policies
CREATE POLICY "Enable read access for medical staff"
  ON patients FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'reception', 'doctor', 'nurse')
  );

CREATE POLICY "Enable insert for reception staff"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'reception')
  );

CREATE POLICY "Enable update for medical staff"
  ON patients FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'reception', 'doctor', 'nurse')
  )
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'reception', 'doctor', 'nurse')
  );

CREATE POLICY "Enable delete for admin"
  ON patients FOR DELETE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Ensure RLS is enabled
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;