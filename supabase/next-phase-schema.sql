
alter table quotes add column if not exists assigned_to text;
alter table quotes add column if not exists priority text default 'normal';

create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text,
  sku text,
  price numeric,
  created_at timestamp with time zone default now()
);

create table if not exists customers (
  id uuid primary key default uuid_generate_v4(),
  company text,
  email text,
  created_at timestamp with time zone default now()
);
