-- Criar função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para atualização de timestamp
CREATE TRIGGER update_sectors_updated_at
    BEFORE UPDATE ON sectors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professionals_updated_at
    BEFORE UPDATE ON professionals
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

CREATE TRIGGER update_medical_records_updated_at
    BEFORE UPDATE ON medical_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_history_updated_at
    BEFORE UPDATE ON medical_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vaccines_updated_at
    BEFORE UPDATE ON vaccines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pharmacy_updated_at
    BEFORE UPDATE ON pharmacy
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medication_dispensing_updated_at
    BEFORE UPDATE ON medication_dispensing
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at
    BEFORE UPDATE ON financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar estoque de medicamentos
CREATE OR REPLACE FUNCTION update_medication_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE pharmacy
        SET stock = stock - NEW.quantity
        WHERE id = NEW.medication_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE pharmacy
        SET stock = stock + OLD.quantity
        WHERE id = OLD.medication_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualização automática do estoque
CREATE TRIGGER update_medication_stock_trigger
    AFTER INSERT OR DELETE ON medication_dispensing
    FOR EACH ROW
    EXECUTE FUNCTION update_medication_stock();

-- Criar views
CREATE OR REPLACE VIEW active_medications AS
SELECT *
FROM pharmacy
WHERE active = true
ORDER BY name;

CREATE OR REPLACE VIEW active_vaccines AS
SELECT *
FROM vaccines
WHERE active = true
ORDER BY name;

CREATE OR REPLACE VIEW appointments_view AS
SELECT 
    a.*,
    p.full_name as patient_name,
    p.cpf as patient_cpf,
    p.sus_card as patient_sus,
    prof.full_name as professional_name,
    s.name as sector_name
FROM appointments a
LEFT JOIN patients p ON a.patient_id = p.id
LEFT JOIN professionals prof ON a.professional_id = prof.id
LEFT JOIN sectors s ON prof.sector_id = s.id
ORDER BY a.date DESC, a.time DESC;

CREATE OR REPLACE VIEW patient_search AS
SELECT 
    id,
    full_name,
    cpf,
    sus_card,
    birth_date,
    phone,
    email,
    active
FROM patients
WHERE active = true
ORDER BY full_name;

CREATE OR REPLACE VIEW patient_medical_history AS
SELECT 
    mh.*,
    p.full_name as patient_name,
    p.cpf as patient_cpf,
    p.sus_card as patient_sus
FROM medical_history mh
LEFT JOIN patients p ON mh.patient_id = p.id
ORDER BY mh.date DESC;

CREATE OR REPLACE VIEW patient_medical_records AS
SELECT 
    mr.*,
    p.full_name as patient_name,
    p.cpf as patient_cpf,
    p.sus_card as patient_sus,
    prof.full_name as professional_name,
    prof.specialty as professional_specialty
FROM medical_records mr
LEFT JOIN patients p ON mr.patient_id = p.id
LEFT JOIN professionals prof ON mr.professional_id = prof.id
ORDER BY mr.created_at DESC;

CREATE OR REPLACE VIEW financial_report AS
SELECT 
    date_trunc('month', date) as month,
    type,
    category,
    SUM(amount) as total_amount,
    COUNT(*) as transaction_count
FROM financial_transactions
GROUP BY date_trunc('month', date), type, category
ORDER BY month DESC, type, category; 