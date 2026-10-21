-- Supplier products can be listed without photos as requested.
-- Zero stock keeps checkout disabled via the existing store and order RPC.
create or replace function public.validate_supplier_product_publish()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if new.is_published and new.stock < 0 then
    raise exception 'Invalid supplier stock';
  end if;
  return new;
end $$;
revoke all on function public.validate_supplier_product_publish() from public, anon, authenticated;
drop trigger if exists validate_supplier_publish on public.products;
create trigger validate_supplier_publish before update of is_published,stock
on public.products for each row execute function public.validate_supplier_product_publish();
