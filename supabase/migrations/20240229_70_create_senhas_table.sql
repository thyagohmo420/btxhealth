-- Criar tipo enum para status
CREATE TYPE status_senha AS ENUM (
    'Aguardando',
    'Em Atendimento',
    'Atendido',
    'Cancelado'
);

-- Criar tipo enum para setor
CREATE TYPE setor_tipo AS ENUM (
    'Recepção',
    'Triagem',
    'Consultório',
    'Enfermagem'
);

-- Criar a tabela senhas
CREATE TABLE senhas (
    id bigserial PRIMARY KEY,
    setor setor_tipo NOT NULL,
    numero integer NOT NULL,
    hora_gerada timestamp DEFAULT now(),
    status status_senha DEFAULT 'Aguardando',
    prioridade text DEFAULT 'normal'
);

-- Criar índice para otimizar buscas por setor
CREATE INDEX idx_senhas_setor ON senhas(setor);

-- Função para gerar nova senha
CREATE OR REPLACE FUNCTION gerar_senha(
    p_setor setor_tipo,
    p_prioridade text DEFAULT 'normal'
) RETURNS json AS $$
DECLARE
    v_numero integer;
    v_id bigint;
BEGIN
    -- Gerar número sequencial para o dia
    SELECT COALESCE(MAX(numero), 0) + 1
    INTO v_numero
    FROM senhas
    WHERE DATE(hora_gerada) = CURRENT_DATE
    AND setor = p_setor;

    -- Inserir nova senha
    INSERT INTO senhas (
        setor,
        numero,
        prioridade
    ) VALUES (
        p_setor,
        v_numero,
        p_prioridade
    )
    RETURNING id INTO v_id;

    RETURN json_build_object(
        'success', true,
        'id', v_id,
        'numero', v_numero,
        'setor', p_setor
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para chamar próxima senha
CREATE OR REPLACE FUNCTION chamar_proxima_senha(
    p_setor setor_tipo
) RETURNS json AS $$
DECLARE
    v_id bigint;
    v_numero integer;
BEGIN
    -- Selecionar próxima senha aguardando
    SELECT id, numero
    INTO v_id, v_numero
    FROM senhas
    WHERE setor = p_setor
    AND status = 'Aguardando'
    AND DATE(hora_gerada) = CURRENT_DATE
    ORDER BY 
        CASE prioridade
            WHEN 'emergencia' THEN 1
            WHEN 'prioritario' THEN 2
            ELSE 3
        END,
        hora_gerada
    LIMIT 1;

    -- Se não encontrou senha aguardando
    IF v_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Nenhuma senha aguardando'
        );
    END IF;

    -- Atualizar status da senha
    UPDATE senhas
    SET status = 'Em Atendimento'
    WHERE id = v_id;

    RETURN json_build_object(
        'success', true,
        'id', v_id,
        'numero', v_numero,
        'setor', p_setor
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para finalizar atendimento
CREATE OR REPLACE FUNCTION finalizar_atendimento(
    p_id bigint
) RETURNS json AS $$
BEGIN
    UPDATE senhas
    SET status = 'Atendido'
    WHERE id = p_id;

    RETURN json_build_object(
        'success', true,
        'message', 'Atendimento finalizado'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar view para painel de senhas
CREATE VIEW painel_senhas AS
SELECT 
    id,
    setor,
    numero,
    status,
    prioridade,
    hora_gerada,
    EXTRACT(EPOCH FROM (NOW() - hora_gerada))::integer as tempo_espera
FROM senhas
WHERE DATE(hora_gerada) = CURRENT_DATE
AND status IN ('Aguardando', 'Em Atendimento')
ORDER BY 
    CASE prioridade
        WHEN 'emergencia' THEN 1
        WHEN 'prioritario' THEN 2
        ELSE 3
    END,
    hora_gerada;

-- Garantir permissões para usuários anônimos
GRANT USAGE ON SEQUENCE senhas_id_seq TO anon;
GRANT ALL ON TABLE senhas TO anon;
GRANT SELECT ON painel_senhas TO anon;
GRANT EXECUTE ON FUNCTION gerar_senha(setor_tipo, text) TO anon;
GRANT EXECUTE ON FUNCTION chamar_proxima_senha(setor_tipo) TO anon;
GRANT EXECUTE ON FUNCTION finalizar_atendimento(bigint) TO anon;

COMMIT; 