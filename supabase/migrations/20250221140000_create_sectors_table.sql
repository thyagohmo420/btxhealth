-- Create sectors table
CREATE TABLE IF NOT EXISTS sectors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  capacity INTEGER NOT NULL,
  occupancy INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  manager VARCHAR(255) NOT NULL,
  staff INTEGER NOT NULL DEFAULT 0,
  schedule VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;

-- Policy for select (read) - authenticated users can read all sectors
CREATE POLICY "Users can view all sectors"
  ON sectors
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for insert - authenticated users can create sectors
CREATE POLICY "Users can create sectors"
  ON sectors
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy for update - authenticated users can update sectors
CREATE POLICY "Users can update sectors"
  ON sectors
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at on update
CREATE OR REPLACE FUNCTION update_sectors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER sectors_updated_at
  BEFORE UPDATE ON sectors
  FOR EACH ROW
  EXECUTE FUNCTION update_sectors_updated_at(); 