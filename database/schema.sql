-- Execute in Supabase SQL Editor. Public storefront has read-only access to published catalog.
create extension if not exists pgcrypto;
create table if not exists public.categories (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, image_url text, sort_order integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now());
create table if not exists public.products (id uuid primary key default gen_random_uuid(), category_id uuid references public.categories(id) on delete set null, name text not null, slug text not null unique, description text, price_iqd bigint not null check(price_iqd>=0), compare_price_iqd bigint check(compare_price_iqd>=0), stock integer not null default 0 check(stock>=0), sku text unique, is_published boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.product_images (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade, image_url text not null, sort_order integer not null default 0);
create table if not exists public.delivery_zones (id uuid primary key default gen_random_uuid(), governorate text not null, zone_name text not null, fee_iqd bigint not null default 0 check(fee_iqd>=0), is_active boolean not null default true);
create table if not exists public.orders (id uuid primary key default gen_random_uuid(), order_number bigint generated always as identity unique, customer_name text not null, customer_phone text not null, delivery_address text not null, delivery_zone_id uuid references public.delivery_zones(id), subtotal_iqd bigint not null check(subtotal_iqd>=0), delivery_fee_iqd bigint not null check(delivery_fee_iqd>=0), total_iqd bigint not null check(total_iqd=subtotal_iqd+delivery_fee_iqd), status text not null default 'new' check(status in ('new','confirmed','processing','shipped','delivered','cancelled')), payment_method text not null default 'cod' check(payment_method in ('cod')), notes text, created_at timestamptz not null default now());
create table if not exists public.order_items (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, product_id uuid references public.products(id) on delete set null, product_name text not null, quantity integer not null check(quantity>0), unit_price_iqd bigint not null check(unit_price_iqd>=0), line_total_iqd bigint generated always as (quantity*unit_price_iqd) stored);
create table if not exists public.admin_users (user_id uuid primary key references auth.users(id) on delete cascade, role text not null default 'admin' check(role in ('owner','admin')));
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_orders_created on public.orders(created_at desc);
create index if not exists idx_order_items_order on public.order_items(order_id);
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.admin_users enable row level security;
create policy "read active categories" on public.categories for select to anon,authenticated using (is_active=true);
create policy "read published products" on public.products for select to anon,authenticated using (is_published=true);
create policy "read published images" on public.product_images for select to anon,authenticated using (exists(select 1 from public.products p where p.id=product_id and p.is_published=true));
create policy "read active delivery zones" on public.delivery_zones for select to anon,authenticated using (is_active=true);
-- No anonymous write policies. Use a server-side Edge Function for checkout, which must validate cart, stock, totals, and delivery fee transactionally.
-- Admin operations must also use verified auth and server-side authorization; never expose service_role credentials in frontend.
