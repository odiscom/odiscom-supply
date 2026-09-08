alter table public.hardware_opportunity_items
  add column if not exists site_name text,
  add column if not exists clin_number text,
  add column if not exists source_item_number text,
  add column if not exists source_sequence integer,
  add column if not exists manufacturer_description text,
  add column if not exists unit_quantity text,
  add column if not exists source_file text,
  add column if not exists delivery_date date,
  add column if not exists quantity_status text not null default 'verified';

alter table public.hardware_opportunity_items
  alter column quantity drop not null;

alter table public.hardware_opportunity_items
  drop constraint if exists hardware_opportunity_items_quantity_status_check;

alter table public.hardware_opportunity_items
  add constraint hardware_opportunity_items_quantity_status_check
  check (quantity_status in ('verified', 'source_unreadable', 'needs_clarification'));

create index if not exists hardware_opportunity_items_site_sequence_idx
  on public.hardware_opportunity_items (opportunity_id, clin_number, source_sequence);
