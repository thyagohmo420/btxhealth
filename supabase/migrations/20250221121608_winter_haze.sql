/*
  # Sistema de Gestão de Atendimento

  1. Novas Tabelas
    - `appointments`
      - Agendamentos e consultas
      - Controle de status e tempos
      - Vinculação com pacientes e profissionais
    - `queue`
      - Fila de espera
      - Prioridades e setores
      - Tempos de atendimento

  2. Campos Adicionados
    - Check-in time
    - Start time
    - End time
    - Status tracking
    - Notes

  3. Segurança
    - RLS habilitado
    - Políticas por perfil de usuário
    - Auditoria de alterações
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

  -- Tabela de fila de espera
  CREATE TABLE IF NOT EXISTS queue (
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
END $$;

-- Habilitar RLS
DO $$ BEGIN
  ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE queue ENABLE ROW LEVEL SECURITY;
END $$;

-- Políticas de RLS
DO $$ BEGIN
  -- Appointments
  CREATE POLICY "Service appointments viewable by authenticated users"
    ON appointments FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Service appointments insertable by staff"
    ON appointments FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'reception', 'doctor', 'nurse'));

  CREATE POLICY "Service appointments updatable by staff"
    ON appointments FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'reception', 'doctor', 'nurse'));

  -- Queue
  CREATE POLICY "Queue viewable by authenticated users"
    ON queue FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Queue insertable by staff"
    ON queue FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'reception', 'doctor', 'nurse'));

  CREATE POLICY "Queue updatable by staff"
    ON queue FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' IN ('admin', 'reception', 'doctor', 'nurse'));
END $$;

-- Criar triggers
SELECT create_trigger_if_not_exists('update_appointments_updated_at_trigger', 'appointments');
SELECT create_trigger_if_not_exists('update_queue_updated_at_trigger', 'queue');

-- Criar índices
DO $$ BEGIN
  -- Appointments
  CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
  CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON appointments(professional_id);
  CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
  CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

  -- Queue
  CREATE INDEX IF NOT EXISTS idx_queue_patient_id ON queue(patient_id);
  CREATE INDEX IF NOT EXISTS idx_queue_sector ON queue(sector);
  CREATE INDEX IF NOT EXISTS idx_queue_status ON queue(status);
  CREATE INDEX IF NOT EXISTS idx_queue_priority ON queue(priority);
  CREATE INDEX IF NOT EXISTS idx_queue_arrival_time ON queue(arrival_time);
END $$;