create extension if not exists "uuid-ossp";

create table if not exists quotes (
  id uuid default uuid_generate_v4() primary key,
  quote_id text not null unique,
  name text not null,
  company text not null,
  email text not null,
  phone text,
  details text,
  status text not null default 'pending',
  internal_notes text,
  created_at timestamp with time zone default now()
);

create table if not exists quote_items (
  id uuid default uuid_generate_v4() primary key,
  quote_id uuid not null references quotes(id) on delete cascade,
  product_slug text not null,
  product_name text not null,
  quantity numeric not null default 1,
  unit text,
  unit_price numeric not null default 0,
  total_price numeric generated always as (quantity * unit_price) stored,
  notes text,
  created_at timestamp with time zone default now()
);

create table if not exists orders (
  id uuid default uuid_generate_v4() primary key,
  quote_id uuid references quotes(id),
  order_number text unique,
  company text,
  contact_name text,
  email text,
  phone text,
  status text default 'new',
  total numeric default 0,
  created_at timestamp with time zone default now()
);

create table if not exists order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_name text,
  quantity numeric,
  unit_price numeric,
  total_price numeric,
  created_at timestamp with time zone default now()
);

create index if not exists quotes_created_at_idx on quotes (created_at desc);
create index if not exists quotes_status_idx on quotes (status);
create index if not exists quote_items_quote_id_idx on quote_items (quote_id);
create index if not exists orders_created_at_idx on orders (created_at desc);
