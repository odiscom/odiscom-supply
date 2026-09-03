alter table public.suppliers add column if not exists onboarding_status text not null default 'target';
alter table public.suppliers add column if not exists priority text not null default 'normal';
alter table public.suppliers add column if not exists next_action text;
alter table public.suppliers add column if not exists application_url text;
alter table public.suppliers add column if not exists updated_at timestamptz not null default now();

-- Initial launch supplier records are inserted idempotently by the matching
-- production migration. Keep this file in source control as schema history.
notify pgrst, 'reload schema';
