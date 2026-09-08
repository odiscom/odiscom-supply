-- Odiscom Supply sourcing pipeline for hardware bids submitted by Odiscom LLC.

alter table public.suppliers add column if not exists brands text;
alter table public.suppliers add column if not exists government_programs text;
alter table public.suppliers add column if not exists resale_certificate_status text not null default 'needed';
alter table public.suppliers add column if not exists credit_status text not null default 'not_started';
alter table public.suppliers add column if not exists account_number text;
alter table public.suppliers add column if not exists sales_rep text;
alter table public.suppliers add column if not exists last_contact_at timestamptz;

create table if not exists public.hardware_opportunities (
  id uuid primary key default gen_random_uuid(),
  solicitation_number text not null unique,
  title text not null,
  agency text,
  contracting_office text,
  notice_type text not null default 'Solicitation',
  naics text,
  psc text,
  set_aside text,
  posted_at timestamptz,
  response_deadline timestamptz,
  source_url text,
  delivery_locations text,
  scope_summary text,
  bidding_entity text not null default 'Odiscom LLC',
  stage text not null default 'discovered'
    check (stage in ('discovered', 'reviewing', 'bid_decision', 'sourcing', 'pricing', 'preparing', 'submitted', 'awarded', 'lost', 'no_bid')),
  priority text not null default 'normal'
    check (priority in ('critical', 'high', 'normal', 'low')),
  fit_score integer check (fit_score between 0 and 100),
  estimated_value numeric(14,2),
  target_revenue numeric(14,2),
  estimated_cost numeric(14,2),
  assigned_to text,
  next_action text,
  next_action_due date,
  submission_method text,
  submission_contact text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hardware_opportunity_items (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.hardware_opportunities(id) on delete cascade,
  line_number text,
  description text not null,
  quantity numeric(14,3) not null default 1 check (quantity > 0),
  unit text not null default 'EA',
  preferred_manufacturer text,
  preferred_part_number text,
  brand_name_or_equal boolean not null default true,
  taa_required boolean not null default false,
  baba_required boolean not null default false,
  domestic_source_required boolean not null default false,
  best_supplier_id uuid references public.suppliers(id),
  unit_cost numeric(14,4),
  freight_allocation numeric(14,2) not null default 0,
  sell_unit_price numeric(14,4),
  lead_time text,
  compliance_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunity_supplier_quotes (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.hardware_opportunities(id) on delete cascade,
  supplier_id uuid not null references public.suppliers(id),
  status text not null default 'target'
    check (status in ('target', 'requested', 'received', 'declined', 'unresponsive', 'selected')),
  rfq_sent_at timestamptz,
  response_due_at timestamptz,
  received_at timestamptz,
  validity_expires_at date,
  material_cost numeric(14,2),
  freight_cost numeric(14,2) not null default 0,
  other_cost numeric(14,2) not null default 0,
  sell_price numeric(14,2),
  lead_time text,
  compliance_status text not null default 'unknown'
    check (compliance_status in ('unknown', 'reviewing', 'compliant', 'exceptions', 'noncompliant')),
  domestic_status text,
  quote_reference text,
  quote_url text,
  contact_name text,
  contact_email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (opportunity_id, supplier_id)
);

create index if not exists hardware_opportunities_stage_deadline_idx
  on public.hardware_opportunities (stage, response_deadline);
create index if not exists hardware_opportunities_priority_deadline_idx
  on public.hardware_opportunities (priority, response_deadline);
create index if not exists hardware_opportunity_items_opportunity_idx
  on public.hardware_opportunity_items (opportunity_id, line_number);
create index if not exists opportunity_supplier_quotes_opportunity_idx
  on public.opportunity_supplier_quotes (opportunity_id, status);
create index if not exists opportunity_supplier_quotes_supplier_idx
  on public.opportunity_supplier_quotes (supplier_id);

alter table public.hardware_opportunities enable row level security;
alter table public.hardware_opportunity_items enable row level security;
alter table public.opportunity_supplier_quotes enable row level security;

revoke all on table public.hardware_opportunities from anon;
revoke all on table public.hardware_opportunity_items from anon;
revoke all on table public.opportunity_supplier_quotes from anon;
grant select, insert, update, delete on table public.hardware_opportunities to authenticated, service_role;
grant select, insert, update, delete on table public.hardware_opportunity_items to authenticated, service_role;
grant select, insert, update, delete on table public.opportunity_supplier_quotes to authenticated, service_role;

drop policy if exists "Admins manage hardware opportunities" on public.hardware_opportunities;
create policy "Admins manage hardware opportunities"
  on public.hardware_opportunities for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

drop policy if exists "Admins manage hardware opportunity items" on public.hardware_opportunity_items;
create policy "Admins manage hardware opportunity items"
  on public.hardware_opportunity_items for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

drop policy if exists "Admins manage opportunity supplier quotes" on public.opportunity_supplier_quotes;
create policy "Admins manage opportunity supplier quotes"
  on public.opportunity_supplier_quotes for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

insert into public.hardware_opportunities (
  solicitation_number, title, agency, contracting_office, notice_type, naics, psc,
  set_aside, posted_at, response_deadline, source_url, delivery_locations,
  scope_summary, bidding_entity, stage, priority, fit_score, assigned_to,
  next_action, next_action_due, submission_method, submission_contact, notes
) values (
  'W50S8326QA002',
  'GASNTi2 Block 1 Nationwide Material Procurement (Electrical & Telecommunications)',
  'Department of Defense / National Guard Bureau',
  'W7NC USPFO Activity MEANG 101',
  'Request for Quote',
  '238210',
  '5975',
  'Total Small Business Set-Aside',
  '2026-08-21 12:15:00-04',
  '2026-09-18 12:00:00-04',
  'https://sam.gov/workspace/contract/opp/afb8f8fcb38640eeb2468d873605f63a/view',
  '11 military installations nationwide',
  'Supply electrical and telecommunications infrastructure materials, grounding, conduit, supporting hardware, and ISO shipping containers for 11 destinations. Firm-fixed-price, supply-only, lowest-price technically acceptable acquisition.',
  'Odiscom LLC',
  'sourcing',
  'critical',
  94,
  'Jeff Johnson',
  'Issue supplier RFQs and collect complete pricing, freight, lead-time, and compliance responses.',
  '2026-09-10',
  'Email',
  '101.msg.msc.contracting@us.af.mil',
  'Odiscom Supply supports sourcing and pricing; Odiscom LLC is the offeror and bidding entity.'
) on conflict (solicitation_number) do update set
  title = excluded.title,
  response_deadline = excluded.response_deadline,
  source_url = excluded.source_url,
  bidding_entity = excluded.bidding_entity,
  updated_at = now();

insert into public.hardware_opportunities (
  solicitation_number, title, agency, contracting_office, notice_type, naics, psc,
  set_aside, posted_at, response_deadline, source_url, delivery_locations,
  scope_summary, bidding_entity, stage, priority, fit_score, assigned_to,
  next_action, next_action_due, submission_method, submission_contact, notes
) values (
  'W50S83-26-Q-0018',
  'GASNTi2 Block 1 Material Procurement — Power Tools and Equipment',
  'Department of Defense / National Guard Bureau',
  'W7NC USPFO Activity MEANG 101',
  'Presolicitation',
  '333991',
  '5180',
  'Total Small Business Set-Aside',
  '2026-09-01 15:55:00-04',
  '2026-09-15 17:00:00-04',
  'https://sam.gov/workspace/contract/opp/c2d5ca572abd4f6a9bed7174c8a91c07/view',
  'South Portland, Maine',
  'Brand-name-or-equal commercial procurement of power tools, hand tools, testing instruments, software, and related material parts for GASNTi2 Block 1.',
  'Odiscom LLC',
  'reviewing',
  'high',
  85,
  'Jeff Johnson',
  'Confirm the final solicitation release and pre-source specified Milwaukee, Greenlee, Burndy, Southwire, and Wiha items.',
  '2026-09-09',
  'To be confirmed in final solicitation',
  '101.msg.msc.contracting@us.af.mil',
  'Treat as a capture and sourcing lead until the final RFQ is released.'
) on conflict (solicitation_number) do update set
  title = excluded.title,
  response_deadline = excluded.response_deadline,
  source_url = excluded.source_url,
  bidding_entity = excluded.bidding_entity,
  updated_at = now();

notify pgrst, 'reload schema';
