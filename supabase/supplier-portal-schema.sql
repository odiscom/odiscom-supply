-- Odiscom Supply supplier portal schema and RLS hardening
-- Run after base schema.sql and next-phase-schema.sql.

alter table suppliers add column if not exists owner_user_id uuid;
alter table suppliers add column if not exists approval_status text default 'pending';
alter table suppliers add column if not exists updated_at timestamp with time zone default now();

alter table products add column if not exists supplier_name text;
alter table products add column if not exists supplier_user_id uuid;
alter table products add column if not exists supplier_status text default 'supplier_review';
alter table products add column if not exists updated_at timestamp with time zone default now();

create table if not exists admin_users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  created_at timestamp with time zone default now()
);

create index if not exists suppliers_owner_user_id_idx on suppliers (owner_user_id);
create index if not exists suppliers_email_idx on suppliers (email);
create index if not exists products_supplier_name_idx on products (supplier_name);
create index if not exists products_supplier_user_id_idx on products (supplier_user_id);
create index if not exists products_supplier_status_idx on products (supplier_status);
create index if not exists admin_users_email_idx on admin_users (email);

alter table suppliers enable row level security;
alter table products enable row level security;

-- Admin helper: add your admin emails here after running this file.
-- insert into admin_users (email) values ('jeff@odiscom.com') on conflict (email) do nothing;

-- Keep active public catalog readable.
drop policy if exists "Allow public product read" on products;
create policy "Allow public product read"
on products
for select
to anon
using (status = 'active');

-- Admin users can fully manage products.
drop policy if exists "Allow authenticated product management" on products;
drop policy if exists "Allow admin product management" on products;
create policy "Allow admin product management"
on products
for all
to authenticated
using (exists (select 1 from admin_users where admin_users.email = auth.jwt() ->> 'email'))
with check (exists (select 1 from admin_users where admin_users.email = auth.jwt() ->> 'email'));

-- Suppliers can read and update their own products only.
drop policy if exists "Allow supplier product select" on products;
create policy "Allow supplier product select"
on products
for select
to authenticated
using (
  supplier_user_id = auth.uid()
  or supplier_name in (select name from suppliers where owner_user_id = auth.uid() or email = auth.jwt() ->> 'email')
  or exists (select 1 from admin_users where admin_users.email = auth.jwt() ->> 'email')
);

drop policy if exists "Allow supplier product insert" on products;
create policy "Allow supplier product insert"
on products
for insert
to authenticated
with check (
  supplier_user_id = auth.uid()
  or supplier_name in (select name from suppliers where owner_user_id = auth.uid() or email = auth.jwt() ->> 'email')
  or exists (select 1 from admin_users where admin_users.email = auth.jwt() ->> 'email')
);

drop policy if exists "Allow supplier product update" on products;
create policy "Allow supplier product update"
on products
for update
to authenticated
using (
  supplier_user_id = auth.uid()
  or supplier_name in (select name from suppliers where owner_user_id = auth.uid() or email = auth.jwt() ->> 'email')
  or exists (select 1 from admin_users where admin_users.email = auth.jwt() ->> 'email')
)
with check (
  supplier_user_id = auth.uid()
  or supplier_name in (select name from suppliers where owner_user_id = auth.uid() or email = auth.jwt() ->> 'email')
  or exists (select 1 from admin_users where admin_users.email = auth.jwt() ->> 'email')
);

-- Supplier profile ownership.
drop policy if exists "Allow authenticated supplier access" on suppliers;
drop policy if exists "Allow admin supplier management" on suppliers;
create policy "Allow admin supplier management"
on suppliers
for all
to authenticated
using (exists (select 1 from admin_users where admin_users.email = auth.jwt() ->> 'email'))
with check (exists (select 1 from admin_users where admin_users.email = auth.jwt() ->> 'email'));

drop policy if exists "Allow supplier profile select" on suppliers;
create policy "Allow supplier profile select"
on suppliers
for select
to authenticated
using (owner_user_id = auth.uid() or email = auth.jwt() ->> 'email' or exists (select 1 from admin_users where admin_users.email = auth.jwt() ->> 'email'));

drop policy if exists "Allow supplier profile insert" on suppliers;
create policy "Allow supplier profile insert"
on suppliers
for insert
to authenticated
with check (owner_user_id = auth.uid() or email = auth.jwt() ->> 'email');

drop policy if exists "Allow supplier profile update" on suppliers;
create policy "Allow supplier profile update"
on suppliers
for update
to authenticated
using (owner_user_id = auth.uid() or email = auth.jwt() ->> 'email')
with check (owner_user_id = auth.uid() or email = auth.jwt() ->> 'email');

notify pgrst, 'reload schema';
