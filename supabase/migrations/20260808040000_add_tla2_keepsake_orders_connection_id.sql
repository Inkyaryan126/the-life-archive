-- Additive migration: Add connection_id to public.keepsake_orders for TLA 2.0 relationship connection persistence
alter table public.keepsake_orders
  add column if not exists connection_id uuid references public.people_connections(id) on delete set null;

create index if not exists keepsake_orders_connection_id_idx
  on public.keepsake_orders (connection_id);
