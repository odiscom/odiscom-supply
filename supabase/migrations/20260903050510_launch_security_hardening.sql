alter table public.quotes add column if not exists acceptance_token text unique;
alter table public.quotes add column if not exists accepted_at timestamptz;

alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.material_uploads enable row level security;

drop policy if exists "Allow public quote access" on public.quotes;
drop policy if exists "Allow public quote insert" on public.quotes;
drop policy if exists "Allow authenticated quote access" on public.quotes;
drop policy if exists "Allow public quote item access" on public.quote_items;
drop policy if exists "Allow authenticated quote item access" on public.quote_items;
drop policy if exists "Allow public order access" on public.orders;
drop policy if exists "Allow authenticated order access" on public.orders;
drop policy if exists "Allow authenticated order item access" on public.order_items;
drop policy if exists "Allow public material upload insert" on public.material_uploads;
drop policy if exists "Allow authenticated material upload access" on public.material_uploads;

create policy "Admins manage quotes" on public.quotes for all to authenticated
using (exists (select 1 from public.admin_users a where lower(a.email) = lower(auth.jwt() ->> 'email')))
with check (exists (select 1 from public.admin_users a where lower(a.email) = lower(auth.jwt() ->> 'email')));
create policy "Admins manage quote items" on public.quote_items for all to authenticated
using (exists (select 1 from public.admin_users a where lower(a.email) = lower(auth.jwt() ->> 'email')))
with check (exists (select 1 from public.admin_users a where lower(a.email) = lower(auth.jwt() ->> 'email')));
create policy "Admins manage orders" on public.orders for all to authenticated
using (exists (select 1 from public.admin_users a where lower(a.email) = lower(auth.jwt() ->> 'email')))
with check (exists (select 1 from public.admin_users a where lower(a.email) = lower(auth.jwt() ->> 'email')));
create policy "Admins manage order items" on public.order_items for all to authenticated
using (exists (select 1 from public.admin_users a where lower(a.email) = lower(auth.jwt() ->> 'email')))
with check (exists (select 1 from public.admin_users a where lower(a.email) = lower(auth.jwt() ->> 'email')));
create policy "Admins manage material uploads" on public.material_uploads for all to authenticated
using (exists (select 1 from public.admin_users a where lower(a.email) = lower(auth.jwt() ->> 'email')))
with check (exists (select 1 from public.admin_users a where lower(a.email) = lower(auth.jwt() ->> 'email')));

insert into public.admin_users (email) values ('jeff@odiscom.com'), ('jacob@odiscom.com') on conflict (email) do nothing;

update storage.buckets set public = false, file_size_limit = 20971520 where id = 'material-uploads';
drop policy if exists "Allow public material uploads" on storage.objects;
drop policy if exists "Allow public material upload reads" on storage.objects;
