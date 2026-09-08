-- Keep unknown prices/costs distinct from zero. Preserve existing business records.
alter table public.quote_items alter column unit_price drop not null;
alter table public.quote_items alter column unit_price drop default;
alter table public.quote_items alter column unit_cost drop default;
alter table public.order_items alter column unit_cost drop default;
alter table public.opportunity_supplier_quotes alter column freight_cost drop not null;
alter table public.opportunity_supplier_quotes alter column freight_cost drop default;
alter table public.opportunity_supplier_quotes alter column other_cost drop not null;
alter table public.opportunity_supplier_quotes alter column other_cost drop default;
alter table public.quote_items add column if not exists cost_confirmed boolean not null default false;
alter table public.order_items add column if not exists cost_confirmed boolean not null default false;
alter table public.opportunity_supplier_quotes add column if not exists costs_confirmed boolean not null default false;
alter table public.quotes add column if not exists accepted_at timestamptz;
alter table public.quotes add column if not exists quoted_at timestamptz;

create or replace function public.accept_quote(p_acceptance_token uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_quote public.quotes%rowtype; v_order public.orders%rowtype; v_total numeric;
begin
 select * into v_quote from public.quotes where acceptance_token = p_acceptance_token for update;
 if not found then raise exception 'Quote not found'; end if;
 if v_quote.status <> 'quoted' or v_quote.accepted_at is not null then raise exception 'Quote is not available for acceptance'; end if;
 if exists(select 1 from public.orders where quote_id = v_quote.id) then raise exception 'An order already exists for this quote; administrator review required'; end if;
 if not exists(select 1 from public.quote_items where quote_id = v_quote.id) or exists(select 1 from public.quote_items where quote_id = v_quote.id and (unit_price is null or unit_price <= 0 or quantity is null or quantity <= 0)) then raise exception 'Quote has unpriced or invalid items'; end if;
 select sum(round(quantity * unit_price, 2)) into v_total from public.quote_items where quote_id = v_quote.id;
 insert into public.orders(quote_id,order_number,company,contact_name,email,phone,total,status)
 values(v_quote.id,'ORD-' || gen_random_uuid()::text,v_quote.company,v_quote.name,v_quote.email,v_quote.phone,v_total,'new') returning * into v_order;
 insert into public.order_items(order_id,product_name,quantity,unit_price,unit_cost,cost_confirmed,supplier_name,total_price)
 select v_order.id,product_name,quantity,unit_price,unit_cost,cost_confirmed,supplier_name,round(quantity*unit_price,2) from public.quote_items where quote_id=v_quote.id;
 update public.quotes set status='accepted',accepted_at=now() where id=v_quote.id;
 return jsonb_build_object('orderNumber',v_order.order_number,'orderId',v_order.id,'total',v_total);
end; $$;
revoke all on function public.accept_quote(uuid) from public,anon,authenticated;
grant execute on function public.accept_quote(uuid) to service_role;
