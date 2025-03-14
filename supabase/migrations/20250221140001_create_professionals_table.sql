-- Create professionals table
CREATE TABLE IF NOT EXISTS professionals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  registration VARCHAR(50) NOT NULL,
  sector VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  schedule VARCHAR(100) NOT NULL,
  patients INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 5.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT check_rating CHECK (rating >= 0 AND rating <= 5)
);

-- Create RLS policies
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

-- Policy for select (read) - authenticated users can read all professionals
CREATE POLICY "Users can view all professionals"
  ON professionals
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for insert - authenticated users can create professionals
CREATE POLICY "Users can create professionals"
  ON professionals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy for update - authenticated users can update professionals
CREATE POLICY "Users can update professionals"
  ON professionals
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at on update
CREATE OR REPLACE FUNCTION update_professionals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER professionals_updated_at
  BEFORE UPDATE ON professionals
  FOR EACH ROW
  EXECUTE FUNCTION update_professionals_updated_at(); 