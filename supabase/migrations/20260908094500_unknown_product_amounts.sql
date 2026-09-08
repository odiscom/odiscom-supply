-- Product catalog defaults are not supplier prices or cost evidence.
alter table public.products alter column price drop default;
alter table public.products alter column cost drop default;
