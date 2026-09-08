-- Cover the optional best-supplier foreign key used when selecting a BOM source.

create index if not exists hardware_opportunity_items_best_supplier_idx
  on public.hardware_opportunity_items (best_supplier_id);
