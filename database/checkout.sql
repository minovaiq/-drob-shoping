create or replace function public.place_cod_order(p_name text,p_phone text,p_address text,p_notes text,p_items jsonb,p_zone uuid default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_order uuid; v_subtotal bigint := 0; v_fee bigint := 0; v_product record; v_item record; v_count integer; v_total bigint;
begin
 if length(btrim(coalesce(p_name,''))) not between 2 and 100 or length(btrim(coalesce(p_address,''))) not between 8 and 300 or coalesce(p_phone,'') !~ '^0[0-9]{9,10}$' or length(coalesce(p_notes,'')) > 500 then
  raise exception 'Invalid customer details';
 end if;
 if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) not between 1 and 20 then raise exception 'Invalid cart'; end if;
 select count(*) into v_count from jsonb_to_recordset(p_items) as x(id uuid,quantity integer);
 if v_count != jsonb_array_length(p_items) then raise exception 'Invalid cart rows'; end if;
 if exists(select 1 from jsonb_to_recordset(p_items) as x(id uuid,quantity integer) where id is null or quantity is null or quantity < 1 or quantity > 20) then raise exception 'Invalid quantity'; end if;
 if (select count(distinct id) from jsonb_to_recordset(p_items) as x(id uuid,quantity integer)) != v_count then raise exception 'Duplicate products'; end if;
 if p_zone is not null then
  select fee_iqd into v_fee from public.delivery_zones where id=p_zone and is_active=true;
  if not found then raise exception 'Invalid delivery zone'; end if;
 end if;
 for v_item in select x.id,x.quantity from jsonb_to_recordset(p_items) as x(id uuid,quantity integer) order by x.id loop
  select id,name,price_iqd,stock into v_product from public.products where id=v_item.id and is_published=true for update;
  if not found or v_product.stock < v_item.quantity then raise exception 'Product unavailable or out of stock'; end if;
  v_subtotal:=v_subtotal+(v_product.price_iqd*v_item.quantity);
 end loop;
 if v_subtotal > 100000000 then raise exception 'Order total too high'; end if;
 v_total:=v_subtotal+v_fee;
 insert into public.orders(customer_name,customer_phone,delivery_address,delivery_zone_id,subtotal_iqd,delivery_fee_iqd,total_iqd,notes)
 values(btrim(p_name),p_phone,btrim(p_address),p_zone,v_subtotal,v_fee,v_total,nullif(btrim(p_notes),''))
 returning id into v_order;
 for v_item in select x.id,x.quantity from jsonb_to_recordset(p_items) as x(id uuid,quantity integer) order by x.id loop
  select id,name,price_iqd into v_product from public.products where id=v_item.id;
  insert into public.order_items(order_id,product_id,product_name,quantity,unit_price_iqd)
  values(v_order,v_product.id,v_product.name,v_item.quantity,v_product.price_iqd);
  update public.products set stock=stock-v_item.quantity,updated_at=now() where id=v_item.id;
 end loop;
 return jsonb_build_object('order_id',v_order,'total_iqd',v_total);
end;$$;
revoke all on function public.place_cod_order(text,text,text,text,jsonb,uuid) from public;
grant execute on function public.place_cod_order(text,text,text,text,jsonb,uuid) to anon,authenticated;