-- Create exam_types table
CREATE TABLE IF NOT EXISTS exam_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- laboratory, imaging, etc
  preparation TEXT,
  duration INTEGER, -- in minutes
  price DECIMAL(10,2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES auth.users(id),
  exam_type_id UUID NOT NULL REFERENCES exam_types(id),
  doctor_id UUID REFERENCES auth.users(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  scheduled_for TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  result_pdf_url TEXT,
  result_data JSONB, -- For structured results data
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create exam_images table
CREATE TABLE IF NOT EXISTS exam_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES exams(id),
  image_url TEXT NOT NULL,
  type VARCHAR(50), -- xray, mri, ct, etc
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create exam_notifications table
CREATE TABLE IF NOT EXISTS exam_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES exams(id),
  recipient_id UUID NOT NULL REFERENCES auth.users(id),
  type VARCHAR(50) NOT NULL, -- email, sms, whatsapp
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, sent, failed
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE exam_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_notifications ENABLE ROW LEVEL SECURITY;

-- Policies for exam_types
CREATE POLICY "Users can view all exam types" ON exam_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can manage exam types" ON exam_types FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policies for exams
CREATE POLICY "Users can view their own exams" ON exams FOR SELECT TO authenticated 
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id);
CREATE POLICY "Staff can manage exams" ON exams FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policies for exam_images
CREATE POLICY "Users can view their own exam images" ON exam_images FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM exams WHERE exams.id = exam_images.exam_id AND (exams.patient_id = auth.uid() OR exams.doctor_id = auth.uid())));
CREATE POLICY "Staff can manage exam images" ON exam_images FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policies for exam_notifications
CREATE POLICY "Users can view their own notifications" ON exam_notifications FOR SELECT TO authenticated 
  USING (recipient_id = auth.uid());
CREATE POLICY "Staff can manage notifications" ON exam_notifications FOR ALL TO authenticated USING (true) WITH CHECK (true); 