/*
  # Adicionar tabelas para gestão médica

  1. Novas Tabelas
    - appointments (agendamentos)
    - vaccines (vacinas)
    - vaccine_records (registros de vacinação)
    - exams (exames)
    - medical_records (prontuários)

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas específicas para cada operação
*/

-- Função auxiliar para criar trigger se não existir
CREATE OR REPLACE FUNCTION create_trigger_if_not_exists(
  trigger_name text,
  table_name text
) RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = trigger_name
  ) THEN
    EXECUTE format(
      'CREATE TRIGGER %I
       BEFORE UPDATE ON %I
       FOR EACH ROW
       EXECUTE FUNCTION update_updated_at_column()',
      trigger_name,
      table_name
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Tabelas
DO $$ BEGIN
  -- Tabela de agendamentos
  CREATE TABLE IF NOT EXISTS appointments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id uuid REFERENCES patients(id),
    professional_id uuid REFERENCES users(id),
    date date NOT NULL,
    time time NOT NULL,
    status text NOT NULL DEFAULT 'scheduled',
    type text NOT NULL,
    notes text,
    check_in_time timestamptz,
    start_time timestamptz,
    end_time timestamptz,
    created_by uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  -- Tabela de vacinas
  CREATE TABLE IF NOT EXISTS vaccines (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    manufacturer text NOT NULL,
    batch text NOT NULL,
    expiration_date date NOT NULL,
    stock int NOT NULL DEFAULT 0,
    min_stock int NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  -- Tabela de registros de vacinação
  CREATE TABLE IF NOT EXISTS vaccine_records (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id uuid REFERENCES patients(id),
    vaccine_id uuid REFERENCES vaccines(id),
    dose_number int NOT NULL,
    application_date date NOT NULL,
    batch text NOT NULL,
    applied_by uuid REFERENCES users(id),
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  -- Tabela de exames
  CREATE TABLE IF NOT EXISTS exams (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id uuid REFERENCES patients(id),
    type text NOT NULL,
    status text NOT NULL DEFAULT 'requested',
    requested_by uuid REFERENCES users(id),
    request_date date NOT NULL,
    result_date date,
    result jsonb,
    files jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  -- Tabela de prontuários
  CREATE TABLE IF NOT EXISTS medical_records (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id uuid REFERENCES patients(id),
    record_type text NOT NULL,
    record_date date NOT NULL,
    professional_id uuid REFERENCES users(id),
    content text NOT NULL,
    attachments jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
END $$;

-- Habilitar RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccine_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
DO $$ BEGIN
  -- Appointments
  DROP POLICY IF EXISTS "Appointments are viewable by authenticated users" ON appointments;
  DROP POLICY IF EXISTS "Appointments are insertable by authenticated users" ON appointments;
  DROP POLICY IF EXISTS "Appointments are updatable by authenticated users" ON appointments;

  CREATE POLICY "Appointments are viewable by authenticated users"
    ON appointments FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Appointments are insertable by authenticated users"
    ON appointments FOR INSERT
    TO authenticated
    WITH CHECK (true);

  CREATE POLICY "Appointments are updatable by authenticated users"
    ON appointments FOR UPDATE
    TO authenticated
    USING (true);

  -- Vaccines
  DROP POLICY IF EXISTS "Vaccines are viewable by authenticated users" ON vaccines;
  DROP POLICY IF EXISTS "Vaccines are insertable by staff" ON vaccines;
  DROP POLICY IF EXISTS "Vaccines are updatable by staff" ON vaccines;

  CREATE POLICY "Vaccines are viewable by authenticated users"
    ON vaccines FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Vaccines are insertable by staff"
    ON vaccines FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'nurse', 'doctor'));

  CREATE POLICY "Vaccines are updatable by staff"
    ON vaccines FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'nurse', 'doctor'));

  -- Vaccine Records
  DROP POLICY IF EXISTS "Vaccine records are viewable by authenticated users" ON vaccine_records;
  DROP POLICY IF EXISTS "Vaccine records are insertable by staff" ON vaccine_records;

  CREATE POLICY "Vaccine records are viewable by authenticated users"
    ON vaccine_records FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Vaccine records are insertable by staff"
    ON vaccine_records FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'nurse', 'doctor'));

  -- Exams
  DROP POLICY IF EXISTS "Exams are viewable by authenticated users" ON exams;
  DROP POLICY IF EXISTS "Exams are insertable by staff" ON exams;
  DROP POLICY IF EXISTS "Exams are updatable by staff" ON exams;

  CREATE POLICY "Exams are viewable by authenticated users"
    ON exams FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Exams are insertable by staff"
    ON exams FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'doctor'));

  CREATE POLICY "Exams are updatable by staff"
    ON exams FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'doctor'));

  -- Medical Records
  DROP POLICY IF EXISTS "Medical records are viewable by authenticated users" ON medical_records;
  DROP POLICY IF EXISTS "Medical records are insertable by staff" ON medical_records;
  DROP POLICY IF EXISTS "Medical records are updatable by staff" ON medical_records;

  CREATE POLICY "Medical records are viewable by authenticated users"
    ON medical_records FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Medical records are insertable by staff"
    ON medical_records FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'doctor', 'nurse'));

  CREATE POLICY "Medical records are updatable by staff"
    ON medical_records FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'doctor', 'nurse'));
END $$;

-- Criar triggers
SELECT create_trigger_if_not_exists('update_appointments_updated_at', 'appointments');
SELECT create_trigger_if_not_exists('update_vaccines_updated_at', 'vaccines');
SELECT create_trigger_if_not_exists('update_vaccine_records_updated_at', 'vaccine_records');
SELECT create_trigger_if_not_exists('update_exams_updated_at', 'exams');
SELECT create_trigger_if_not_exists('update_medical_records_updated_at', 'medical_records');

-- Criar índices
DO $$ BEGIN
  -- Appointments
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_appointments_patient_id') THEN
    CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_appointments_professional_id') THEN
    CREATE INDEX idx_appointments_professional_id ON appointments(professional_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_appointments_date') THEN
    CREATE INDEX idx_appointments_date ON appointments(date);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_appointments_status') THEN
    CREATE INDEX idx_appointments_status ON appointments(status);
  END IF;

  -- Vaccines
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vaccines_name') THEN
    CREATE INDEX idx_vaccines_name ON vaccines(name);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vaccines_batch') THEN
    CREATE INDEX idx_vaccines_batch ON vaccines(batch);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vaccines_expiration_date') THEN
    CREATE INDEX idx_vaccines_expiration_date ON vaccines(expiration_date);
  END IF;

  -- Vaccine Records
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vaccine_records_patient_id') THEN
    CREATE INDEX idx_vaccine_records_patient_id ON vaccine_records(patient_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vaccine_records_vaccine_id') THEN
    CREATE INDEX idx_vaccine_records_vaccine_id ON vaccine_records(vaccine_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vaccine_records_application_date') THEN
    CREATE INDEX idx_vaccine_records_application_date ON vaccine_records(application_date);
  END IF;

  -- Exams
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_exams_patient_id') THEN
    CREATE INDEX idx_exams_patient_id ON exams(patient_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_exams_type') THEN
    CREATE INDEX idx_exams_type ON exams(type);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_exams_status') THEN
    CREATE INDEX idx_exams_status ON exams(status);
  END IF;

  -- Medical Records
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_medical_records_patient_id') THEN
    CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_medical_records_professional_id') THEN
    CREATE INDEX idx_medical_records_professional_id ON medical_records(professional_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_medical_records_record_date') THEN
    CREATE INDEX idx_medical_records_record_date ON medical_records(record_date);
  END IF;
END $$;