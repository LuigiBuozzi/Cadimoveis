-- Cadimoveis: dados atuais do banco (PostgreSQL), exportados do SQLite em 2026-10-23 11:58.
-- Rode depois do schema.sql. Sessões e cache não são copiados: os usuários só precisam entrar de novo.
-- As fotos e os PDFs não estão aqui: o banco guarda apenas o caminho dos arquivos em storage/app.

BEGIN;

-- users (1 linha)
insert into "users" ("id", "name", "email", "email_verified_at", "password", "remember_token", "created_at", "updated_at", "is_broker", "creci", "is_admin") values (1, 'teste', 'teste@cadimoveis.com', null, '$2y$12$GlMEGu60btgisKrVOaTyye88tlSE64lEkTT7OI1/fXoYehn7PoMCq', null, '2026-10-22 20:21:01', '2026-10-22 21:34:53', false, null, true);
select setval(pg_get_serial_sequence('"users"', 'id'), coalesce((select max("id") from "users"), 0) + 1, false);

-- listings (1 linha)
insert into "listings" ("id", "user_id", "type", "cep", "street", "number", "neighborhood", "city", "state", "bedrooms", "suites", "kitchens", "laundry_rooms", "living_rooms", "dining_rooms", "bathrooms", "half_bathrooms", "pantries", "features", "nearby_places", "created_at", "updated_at", "status", "deal", "price") values (1, 1, 'casa-terrea', '79010190', 'Rua José Antônio', '3132', 'Monte Castelo', 'Campo Grande', 'MS', 0, 0, 0, 0, 0, 0, 0, 0, 0, '[]', '[]', '2026-10-22 21:20:10', '2026-10-22 21:35:09', 'approved', 'aluguel', 1000);
select setval(pg_get_serial_sequence('"listings"', 'id'), coalesce((select max("id") from "listings"), 0) + 1, false);

-- listing_photos (1 linha)
insert into "listing_photos" ("id", "listing_id", "path", "room", "is_featured", "position", "created_at", "updated_at") values (1, 1, 'listings/1/photos/QrJxuCH2XxFIjofLEjnskzEyvechY2FpNQPVL6JJ.jpg', 'fachada', true, 0, '2026-10-22 21:20:10', '2026-10-22 21:20:10');
select setval(pg_get_serial_sequence('"listing_photos"', 'id'), coalesce((select max("id") from "listing_photos"), 0) + 1, false);

-- listing_documents (0 linhas)
select setval(pg_get_serial_sequence('"listing_documents"', 'id'), coalesce((select max("id") from "listing_documents"), 0) + 1, false);

COMMIT;
