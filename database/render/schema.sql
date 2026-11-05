-- Cadimoveis: estrutura do banco de dados (PostgreSQL).
-- Gerado a partir das migrações em database/migrations. Rode uma única vez, em um banco vazio.
-- A tabela "migrations" é preenchida para o Laravel saber que essas migrações já foram aplicadas.

BEGIN;

create table "migrations" ("id" serial not null primary key, "migration" varchar(255) not null, "batch" integer not null);

-- 0001_01_01_000000_create_users_table
create table "users" ("id" bigserial not null primary key, "name" varchar(255) not null, "email" varchar(255) not null, "email_verified_at" timestamp(0) without time zone null, "password" varchar(255) not null, "remember_token" varchar(100) null, "created_at" timestamp(0) without time zone null, "updated_at" timestamp(0) without time zone null);
alter table "users" add constraint "users_email_unique" unique ("email");
create table "password_reset_tokens" ("email" varchar(255) not null, "token" varchar(255) not null, "created_at" timestamp(0) without time zone null);
alter table "password_reset_tokens" add primary key ("email");
create table "sessions" ("id" varchar(255) not null, "user_id" bigint null, "ip_address" varchar(45) null, "user_agent" text null, "payload" text not null, "last_activity" integer not null);
alter table "sessions" add primary key ("id");
create index "sessions_user_id_index" on "sessions" ("user_id");
create index "sessions_last_activity_index" on "sessions" ("last_activity");

-- 0001_01_01_000001_create_cache_table
create table "cache" ("key" varchar(255) not null, "value" text not null, "expiration" bigint not null);
alter table "cache" add primary key ("key");
create index "cache_expiration_index" on "cache" ("expiration");
create table "cache_locks" ("key" varchar(255) not null, "owner" varchar(255) not null, "expiration" bigint not null);
alter table "cache_locks" add primary key ("key");
create index "cache_locks_expiration_index" on "cache_locks" ("expiration");

-- 0001_01_01_000002_create_jobs_table
create table "jobs" ("id" bigserial not null primary key, "queue" varchar(255) not null, "payload" text not null, "attempts" smallint not null, "reserved_at" integer null, "available_at" integer not null, "created_at" integer not null);
create index "jobs_queue_index" on "jobs" ("queue");
create table "job_batches" ("id" varchar(255) not null, "name" varchar(255) not null, "total_jobs" integer not null, "pending_jobs" integer not null, "failed_jobs" integer not null, "failed_job_ids" text not null, "options" text null, "cancelled_at" integer null, "created_at" integer not null, "finished_at" integer null);
alter table "job_batches" add primary key ("id");
create table "failed_jobs" ("id" bigserial not null primary key, "uuid" varchar(255) not null, "connection" varchar(255) not null, "queue" varchar(255) not null, "payload" text not null, "exception" text not null, "failed_at" timestamp(0) without time zone not null default CURRENT_TIMESTAMP);
create index "failed_jobs_connection_queue_failed_at_index" on "failed_jobs" ("connection", "queue", "failed_at");
alter table "failed_jobs" add constraint "failed_jobs_uuid_unique" unique ("uuid");

-- 2026_10_22_202545_add_broker_fields_to_users_table
alter table "users" add column "is_broker" boolean not null default '0';
alter table "users" add column "creci" varchar(20) null;

-- 2026_10_22_211249_add_is_admin_to_users_table
alter table "users" add column "is_admin" boolean not null default '0';

-- 2026_10_22_211250_create_listings_table
create table "listings" ("id" bigserial not null primary key, "user_id" bigint not null, "type" varchar(255) not null, "cep" varchar(8) not null, "street" varchar(255) not null, "number" varchar(10) not null, "neighborhood" varchar(255) null, "city" varchar(255) not null, "state" varchar(2) not null, "bedrooms" smallint not null default '0', "suites" smallint not null default '0', "kitchens" smallint not null default '0', "laundry_rooms" smallint not null default '0', "living_rooms" smallint not null default '0', "dining_rooms" smallint not null default '0', "bathrooms" smallint not null default '0', "half_bathrooms" smallint not null default '0', "pantries" smallint not null default '0', "features" json not null, "nearby_places" json not null, "created_at" timestamp(0) without time zone null, "updated_at" timestamp(0) without time zone null);
alter table "listings" add constraint "listings_user_id_foreign" foreign key ("user_id") references "users" ("id") on delete cascade;
create index "listings_state_city_index" on "listings" ("state", "city");
create index "listings_type_index" on "listings" ("type");

-- 2026_10_22_211251_create_listing_photos_table
create table "listing_photos" ("id" bigserial not null primary key, "listing_id" bigint not null, "path" varchar(255) not null, "room" varchar(255) null, "is_featured" boolean not null default '0', "position" smallint not null default '0', "created_at" timestamp(0) without time zone null, "updated_at" timestamp(0) without time zone null);
alter table "listing_photos" add constraint "listing_photos_listing_id_foreign" foreign key ("listing_id") references "listings" ("id") on delete cascade;

-- 2026_10_22_211252_create_listing_documents_table
create table "listing_documents" ("id" bigserial not null primary key, "listing_id" bigint not null, "path" varchar(255) not null, "original_name" varchar(255) not null, "size" integer not null, "created_at" timestamp(0) without time zone null, "updated_at" timestamp(0) without time zone null);
alter table "listing_documents" add constraint "listing_documents_listing_id_foreign" foreign key ("listing_id") references "listings" ("id") on delete cascade;

-- 2026_10_22_212223_add_status_to_listings_table
alter table "listings" add column "status" varchar(255) not null default 'pending';
create index "listings_status_index" on "listings" ("status");

-- 2026_10_22_213210_add_deal_and_price_to_listings_table
alter table "listings" add column "deal" varchar(255) null;
alter table "listings" add column "price" bigint null;
create index "listings_deal_index" on "listings" ("deal");
create index "listings_price_index" on "listings" ("price");

insert into "migrations" ("migration", "batch") values
    ('0001_01_01_000000_create_users_table', 1),
    ('0001_01_01_000001_create_cache_table', 1),
    ('0001_01_01_000002_create_jobs_table', 1),
    ('2026_10_22_202545_add_broker_fields_to_users_table', 1),
    ('2026_10_22_211249_add_is_admin_to_users_table', 1),
    ('2026_10_22_211250_create_listings_table', 1),
    ('2026_10_22_211251_create_listing_photos_table', 1),
    ('2026_10_22_211252_create_listing_documents_table', 1),
    ('2026_10_22_212223_add_status_to_listings_table', 1),
    ('2026_10_22_213210_add_deal_and_price_to_listings_table', 1);

COMMIT;
