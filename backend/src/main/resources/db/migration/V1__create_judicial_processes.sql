CREATE TABLE judicial_processes (
    id               BIGSERIAL PRIMARY KEY,
    process_number   VARCHAR(25)  NOT NULL UNIQUE,
    subject          VARCHAR(255) NOT NULL,
    description      VARCHAR(1000),
    status           VARCHAR(20)  NOT NULL,
    responsible_name  VARCHAR(150) NOT NULL,
    responsible_email VARCHAR(150) NOT NULL,
    opening_date     DATE         NOT NULL,
    closing_date     DATE,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_process_number ON judicial_processes (process_number);
CREATE INDEX idx_process_status  ON judicial_processes (status);

-- Seed data
INSERT INTO judicial_processes (process_number, subject, description, status, responsible_name, responsible_email, opening_date)
VALUES
  ('1234567-89.2024.8.26.0001', 'Execução Fiscal - IPTU 2020', 'Cobrança de IPTU referente ao exercício de 2020', 'ACTIVE',   'Dra. Ana Paula Ferreira', 'ana.ferreira@procuradoria.sp.gov.br', '2024-01-10'),
  ('9876543-21.2023.8.26.0100', 'Ação de Cobrança - ISS',      'Débito de ISS não recolhido pelo contribuinte',  'SUSPENDED', 'Dr. Carlos Mendes',       'carlos.mendes@procuradoria.sp.gov.br', '2023-06-15'),
  ('1111111-11.2022.8.26.0050', 'Execução Fiscal - IPTU 2019', 'Processo encerrado após pagamento integral',     'CLOSED',    'Dra. Beatriz Lima',       'beatriz.lima@procuradoria.sp.gov.br',  '2022-03-20'),
  ('2222222-22.2024.8.26.0200', 'Ação Ordinária - Restituição','Pedido de restituição de tributo pago indevido', 'ACTIVE',    'Dr. Rafael Souza',        'rafael.souza@procuradoria.sp.gov.br',  '2024-05-01'),
  ('3333333-33.2021.8.26.0300', 'Execução Fiscal - ISSQN',     'Processo arquivado por prescrição',              'ARCHIVED',  'Dra. Fernanda Costa',     'fernanda.costa@procuradoria.sp.gov.br','2021-11-08');
