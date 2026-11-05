-- Cadimoveis: estrutura do banco de dados (PostgreSQL), para importar no StackRender.
-- Mesmas tabelas e colunas das migrações em database/migrations.
-- Inclui só as tabelas do sistema. As tabelas internas do Laravel (sessions,
-- cache, cache_locks, jobs, job_batches, failed_jobs, password_reset_tokens e
-- migrations) ficaram de fora.

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP(0) NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    is_broker BOOLEAN NOT NULL DEFAULT FALSE, -- é corretor de imóveis
    creci VARCHAR(20) NULL,                    -- registro do corretor
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,  -- pode aprovar, editar e excluir qualquer anúncio
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL
);

CREATE TABLE listings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE, -- dono do anúncio
    type VARCHAR(255) NOT NULL,                       -- casa-terrea, apartamento, sobrado, imovel-rural
    status VARCHAR(255) NOT NULL DEFAULT 'pending',   -- pending (em análise) ou approved
    deal VARCHAR(255) NULL,                           -- aluguel ou venda
    price BIGINT NULL,                                -- em reais; no aluguel, valor mensal
    cep VARCHAR(8) NOT NULL,
    street VARCHAR(255) NOT NULL,
    number VARCHAR(10) NOT NULL,
    neighborhood VARCHAR(255) NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(2) NOT NULL,
    bedrooms SMALLINT NOT NULL DEFAULT 0,
    suites SMALLINT NOT NULL DEFAULT 0,
    kitchens SMALLINT NOT NULL DEFAULT 0,
    laundry_rooms SMALLINT NOT NULL DEFAULT 0,
    living_rooms SMALLINT NOT NULL DEFAULT 0,
    dining_rooms SMALLINT NOT NULL DEFAULT 0,
    bathrooms SMALLINT NOT NULL DEFAULT 0,
    half_bathrooms SMALLINT NOT NULL DEFAULT 0,
    pantries SMALLINT NOT NULL DEFAULT 0,
    features JSON NOT NULL,       -- itens marcados, ex.: ["has_garage", "has_alarm"]
    nearby_places JSON NOT NULL,  -- pontos de interesse, ex.: ["near_park", "near_bakery"]
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL
);

CREATE INDEX listings_status_index ON listings (status);
CREATE INDEX listings_type_index ON listings (type);
CREATE INDEX listings_deal_index ON listings (deal);
CREATE INDEX listings_price_index ON listings (price);
CREATE INDEX listings_state_city_index ON listings (state, city);

CREATE TABLE listing_photos (
    id BIGSERIAL PRIMARY KEY,
    listing_id BIGINT NOT NULL REFERENCES listings (id) ON DELETE CASCADE,
    path VARCHAR(255) NOT NULL,                  -- caminho do arquivo em storage/app/public
    room VARCHAR(255) NULL,                      -- quarto, sala-de-estar, cozinha, fachada...
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,  -- foto de destaque (imagem principal na pesquisa)
    position SMALLINT NOT NULL DEFAULT 0,        -- ordem das fotos
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL
);

CREATE TABLE listing_documents (
    id BIGSERIAL PRIMARY KEY,
    listing_id BIGINT NOT NULL REFERENCES listings (id) ON DELETE CASCADE,
    path VARCHAR(255) NOT NULL,           -- caminho do PDF em storage/app/private
    original_name VARCHAR(255) NOT NULL,
    size INTEGER NOT NULL,                -- tamanho em bytes
    created_at TIMESTAMP(0) NULL,
    updated_at TIMESTAMP(0) NULL
);
