-- =============================================================================
-- Sophia Vendas - Dados de exemplo (opcional)
--
-- Execute após o create-database.sql:
--   psql -U postgres -d sophia -f seed.sql
--
-- Equivale ao DbSeeder da API, que roda automaticamente em Development
-- quando o banco está vazio.
-- =============================================================================

START TRANSACTION;

INSERT INTO clientes (cpf, nome, data_nascimento, email, telefone) VALUES
    ('52998224725', 'Ana Paula Souza',       '1990-03-15', 'ana.souza@email.com',       '11987654321'),
    ('11144477735', 'Bruno Henrique Lima',   '1985-07-22', 'bruno.lima@email.com',      '21998765432'),
    ('12345678909', 'Carla Mendes Oliveira', '1998-11-02', NULL,                        '31991234567'),
    ('98765432100', 'Daniel Costa Ferreira', NULL,         'daniel.ferreira@email.com', NULL),
    ('39053344705', 'Eduarda Santos Rocha',  '2001-01-30', 'eduarda.rocha@email.com',   '4133224455');

INSERT INTO produtos (nome, valor_unitario) VALUES
    ('Notebook 15"',       3899.90),
    ('Mouse sem fio',        89.90),
    ('Teclado mecânico',    349.00),
    ('Monitor 27"',        1599.00),
    ('Headset USB',         249.90),
    ('Webcam Full HD',      199.90),
    ('Cadeira ergonômica', 1290.00),
    ('Mousepad',             39.90);

-- Vendas referenciando clientes e produtos pelas chaves naturais (CPF e nome)
WITH venda AS (
    INSERT INTO vendas (data_venda, cliente_id)
    SELECT CURRENT_DATE - 2, id FROM clientes WHERE cpf = '52998224725'
    RETURNING id
)
INSERT INTO itens_venda (venda_id, produto_id, quantidade, valor_unitario)
SELECT venda.id, p.id, 1, p.valor_unitario
FROM venda CROSS JOIN produtos p
WHERE p.nome IN ('Notebook 15"', 'Mouse sem fio', 'Mousepad');

WITH venda AS (
    INSERT INTO vendas (data_venda, cliente_id)
    SELECT CURRENT_DATE - 1, id FROM clientes WHERE cpf = '11144477735'
    RETURNING id
)
INSERT INTO itens_venda (venda_id, produto_id, quantidade, valor_unitario)
SELECT venda.id, p.id, i.quantidade, i.valor_unitario
FROM venda
CROSS JOIN (VALUES ('Monitor 27"', 2, 1499.00), ('Teclado mecânico', 1, 349.00)) AS i (nome, quantidade, valor_unitario)
JOIN produtos p ON p.nome = i.nome;

WITH venda AS (
    INSERT INTO vendas (data_venda, cliente_id)
    SELECT CURRENT_DATE, id FROM clientes WHERE cpf = '12345678909'
    RETURNING id
)
INSERT INTO itens_venda (venda_id, produto_id, quantidade, valor_unitario)
SELECT venda.id, p.id, 3, p.valor_unitario
FROM venda CROSS JOIN produtos p
WHERE p.nome = 'Headset USB';

COMMIT;
