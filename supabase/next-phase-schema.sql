-- Odiscom Supply next-phase schema
-- Run this after the base schema.sql has already been applied.

create extension if not exists "uuid-ossp";

alter table quotes add column if not exists assigned_to text;
alter table quotes add column if not exists priority text default 'normal';
alter table quotes add column if not exists source text default 'website';

create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  sku text unique,
  category text,
  manufacturer text,
  description text,
  price numeric default 0,
  cost numeric default 0,
  unit text default 'each',
  lead_time text,
  status text default 'active',
  image_url text,
  spec_sheet_url text,
  created_at timestamp with time zone default now()
);

create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  company text,
  contact_name text,
  email text unique,
  phone text,
  account_status text default 'prospect',
  pricing_tier text default 'standard',
  created_at timestamp with time zone default now()
);

create table if not exists suppliers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  contact_name text,
  email text,
  phone text,
  website text,
  notes text,
  created_at timestamp with time zone default now()
);

create table if not exists material_uploads (
  id uuid primary key default uuid_generate_v4(),
  customer_email text,
  company text,
  file_name text,
  file_url text,
  notes text,
  status text default 'new',
  created_at timestamp with time zone default now()
);

create index if not exists products_category_idx on products (category);
create index if not exists products_sku_idx on products (sku);
create index if not exists customers_email_idx on customers (email);
create index if not exists material_uploads_status_idx on material_uploads (status);
