-- Prevent an accepted amount from differing from the issued PDF.
create or replace function public.guard_issued_quote_items()
returns trigger language plpgsql security definer set search_path='' as $$
declare q_status text; qid uuid;
begin
 if TG_OP='UPDATE' and NEW.quote_id is distinct from OLD.quote_id then raise exception 'Moving quote items is not supported'; end if;
 qid := case when TG_OP='DELETE' then OLD.quote_id else NEW.quote_id end;
 select status into q_status from public.quotes where id=qid for update;
 if q_status in ('quoted','accepted') then raise exception 'Issued quote items are locked. Return the quote to pending before repricing and reissue it.'; end if;
 if TG_OP='DELETE' then return OLD; end if;
 return NEW;
end; $$;
drop trigger if exists protect_issued_quote_items on public.quote_items;
create trigger protect_issued_quote_items before insert or update or delete on public.quote_items for each row execute function public.guard_issued_quote_items();

create or replace function public.prepare_quote_issue(p_quote_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare q public.quotes%rowtype; item_rows jsonb;
begin
 select * into q from public.quotes where id=p_quote_id for update;
 if not found or q.status='accepted' or q.accepted_at is not null or exists(select 1 from public.orders where quote_id=q.id) then raise exception 'Quote is not available for issuance'; end if;
 perform id from public.quote_items where quote_id=q.id for update;
 if not exists(select 1 from public.quote_items where quote_id=q.id) or exists(select 1 from public.quote_items where quote_id=q.id and (unit_price is null or unit_price<=0 or quantity<=0)) then raise exception 'Every quote line requires a positive selling price and quantity'; end if;
 update public.quotes set status='quoted',quoted_at=now(),acceptance_token=gen_random_uuid() where id=q.id returning * into q;
 select jsonb_agg(to_jsonb(i) order by i.created_at,i.id) into item_rows from public.quote_items i where i.quote_id=q.id;
 return jsonb_build_object('quote',to_jsonb(q),'items',item_rows);
end; $$;
revoke all on function public.prepare_quote_issue(uuid) from public,anon,authenticated;
grant execute on function public.prepare_quote_issue(uuid) to service_role;
