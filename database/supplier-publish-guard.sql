-- Run in Supabase SQL Editor after creating supplier_product_metadata.
-- Prevent publishing supplier products without a confirmed stock and image.
create or replace function public.validate_supplier_product_publish()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if new.is_published and exists (
    select 1 from public.supplier_product_metadata m where m.product_id = new.id
  ) then
    if new.stock <= 0 then
      raise exception 'Supplier product needs confirmed stock before publishing';
    end if;
    if not exists (
      select 1 from public.product_images i where i.product_id = new.id
    ) then
      raise exception 'Supplier product needs at least one uploaded image before publishing';
    end if;
  end if;
  return new;
end $$;
revoke all on function public.validate_supplier_product_publish() from public, anon, authenticated;
drop trigger if exists validate_supplier_publish on public.products;
create trigger validate_supplier_publish
before update of is_published, stock on public.products
for each row execute function public.validate_supplier_product_publish();
