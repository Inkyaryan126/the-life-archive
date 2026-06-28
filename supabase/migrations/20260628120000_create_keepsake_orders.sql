-- Minimal keepsake fulfillment orders captured from Stripe Checkout.

create table if not exists public.keepsake_orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,
  customer_email text,
  product_name text not null,
  amount_paid integer not null default 0,
  currency text not null default 'usd',
  payment_status text not null default 'unpaid',
  fulfillment_status text not null default 'New',
  archive_slug text,
  notes text not null default '',
  stripe_session_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint keepsake_orders_fulfillment_status_check
    check (fulfillment_status in (
      'New',
      'Needs Personalization',
      'In Production',
      'Shipped',
      'Completed'
    )),
  constraint keepsake_orders_stripe_session_id_check
    check (nullif(btrim(stripe_session_id), '') is not null),
  constraint keepsake_orders_product_name_check
    check (nullif(btrim(product_name), '') is not null)
);

create index if not exists keepsake_orders_created_at_idx
  on public.keepsake_orders (created_at desc);

create index if not exists keepsake_orders_fulfillment_status_idx
  on public.keepsake_orders (fulfillment_status);

create or replace function public.set_keepsake_orders_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_keepsake_orders_updated_at on public.keepsake_orders;
create trigger set_keepsake_orders_updated_at
before update on public.keepsake_orders
for each row execute function public.set_keepsake_orders_updated_at();

alter table public.keepsake_orders enable row level security;
