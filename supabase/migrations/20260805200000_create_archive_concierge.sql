-- Archive Concierge Phase 1 foundation.
-- Admin management is intentionally handled through existing server-side
-- admin authorization and the service-role client. Customer RLS below remains
-- strict and does not expose anonymous order enumeration.

create sequence if not exists public.concierge_order_number_seq;

create or replace function public.generate_concierge_order_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_value bigint;
begin
  next_value := nextval('public.concierge_order_number_seq');
  return 'AC-' || to_char(now(), 'YYYY') || '-' || lpad(next_value::text, 6, '0');
end;
$$;

create table if not exists public.concierge_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_id uuid references auth.users(id) on delete set null,
  customer_email text not null,
  customer_name text not null,
  customer_phone text,
  archive_subject_name text not null,
  archive_type text not null,
  package_key text not null,
  status text not null default 'inquiry',
  service_method text,
  memorial_deadline timestamptz,
  event_type text,
  assigned_admin_id uuid references auth.users(id) on delete set null,
  archive_id uuid references public.archives(id) on delete set null,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  amount_paid integer,
  currency text,
  customer_notes text,
  internal_notes text,
  requested_item_count integer,
  received_item_count integer not null default 0,
  included_revision_count integer not null default 0,
  used_revision_count integer not null default 0,
  is_rush boolean not null default false,
  customer_approved_at timestamptz,
  completed_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint concierge_orders_archive_type_check
    check (archive_type in ('living', 'memorial')),
  constraint concierge_orders_package_key_check
    check (package_key in ('essential', 'legacy', 'family_legacy', 'custom')),
  constraint concierge_orders_status_check
    check (status in (
      'inquiry',
      'awaiting_payment',
      'paid',
      'intake_required',
      'awaiting_materials',
      'materials_received',
      'under_review',
      'in_production',
      'customer_review',
      'changes_requested',
      'approved',
      'keepsakes_in_production',
      'ready_for_pickup',
      'shipped',
      'completed',
      'on_hold',
      'canceled'
    )),
  constraint concierge_orders_service_method_check
    check (
      service_method is null
      or service_method in (
        'secure_upload',
        'cloud_link',
        'usb_dropoff',
        'hard_drive_dropoff',
        'phone_transfer',
        'physical_materials',
        'local_pickup',
        'mixed'
      )
    ),
  constraint concierge_orders_email_normalized_check
    check (customer_email = lower(trim(customer_email))),
  constraint concierge_orders_nonnegative_counts_check
    check (
      coalesce(requested_item_count, 0) >= 0
      and received_item_count >= 0
      and included_revision_count >= 0
      and used_revision_count >= 0
    ),
  constraint concierge_orders_amount_paid_check
    check (amount_paid is null or amount_paid >= 0),
  constraint concierge_orders_order_number_format_check
    check (order_number ~ '^AC-[0-9]{4}-[0-9]{6,}$')
);

create table if not exists public.concierge_order_status_history (
  id uuid primary key default gen_random_uuid(),
  concierge_order_id uuid not null references public.concierge_orders(id) on delete cascade,
  previous_status text,
  new_status text not null,
  changed_by uuid references auth.users(id) on delete set null,
  customer_visible boolean not null default true,
  note text,
  created_at timestamptz not null default now(),
  constraint concierge_order_status_history_previous_status_check
    check (
      previous_status is null
      or previous_status in (
        'inquiry',
        'awaiting_payment',
        'paid',
        'intake_required',
        'awaiting_materials',
        'materials_received',
        'under_review',
        'in_production',
        'customer_review',
        'changes_requested',
        'approved',
        'keepsakes_in_production',
        'ready_for_pickup',
        'shipped',
        'completed',
        'on_hold',
        'canceled'
      )
    ),
  constraint concierge_order_status_history_new_status_check
    check (new_status in (
      'inquiry',
      'awaiting_payment',
      'paid',
      'intake_required',
      'awaiting_materials',
      'materials_received',
      'under_review',
      'in_production',
      'customer_review',
      'changes_requested',
      'approved',
      'keepsakes_in_production',
      'ready_for_pickup',
      'shipped',
      'completed',
      'on_hold',
      'canceled'
    ))
);

create table if not exists public.concierge_order_materials (
  id uuid primary key default gen_random_uuid(),
  concierge_order_id uuid not null references public.concierge_orders(id) on delete cascade,
  material_type text not null,
  original_name text,
  quantity integer not null default 1,
  storage_path text,
  external_url text,
  intake_condition text,
  customer_description text,
  internal_notes text,
  received_at timestamptz,
  returned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint concierge_order_materials_type_check
    check (material_type in (
      'photo',
      'video',
      'audio',
      'document',
      'written_story',
      'usb_drive',
      'hard_drive',
      'phone',
      'photo_album',
      'physical_document',
      'other'
    )),
  constraint concierge_order_materials_quantity_check
    check (quantity > 0)
);

create table if not exists public.concierge_order_revisions (
  id uuid primary key default gen_random_uuid(),
  concierge_order_id uuid not null references public.concierge_orders(id) on delete cascade,
  requested_by uuid references auth.users(id) on delete set null,
  request_text text not null,
  status text not null default 'requested',
  resolved_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  constraint concierge_order_revisions_status_check
    check (status in ('requested', 'reviewing', 'completed', 'declined')),
  constraint concierge_order_revisions_request_text_check
    check (length(btrim(request_text)) > 0)
);

create table if not exists public.concierge_order_keepsakes (
  id uuid primary key default gen_random_uuid(),
  concierge_order_id uuid not null references public.concierge_orders(id) on delete cascade,
  keepsake_type text not null,
  quantity integer not null default 1,
  engraving_text text,
  production_status text not null default 'planned',
  tracking_number text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint concierge_order_keepsakes_status_check
    check (production_status in (
      'planned',
      'awaiting_approval',
      'approved',
      'in_production',
      'ready',
      'shipped',
      'picked_up',
      'canceled'
    )),
  constraint concierge_order_keepsakes_quantity_check
    check (quantity > 0),
  constraint concierge_order_keepsakes_type_check
    check (length(btrim(keepsake_type)) > 0)
);

drop trigger if exists set_concierge_orders_updated_at on public.concierge_orders;
create trigger set_concierge_orders_updated_at
before update on public.concierge_orders
for each row
execute function public.set_updated_at();

drop trigger if exists set_concierge_order_materials_updated_at on public.concierge_order_materials;
create trigger set_concierge_order_materials_updated_at
before update on public.concierge_order_materials
for each row
execute function public.set_updated_at();

drop trigger if exists set_concierge_order_keepsakes_updated_at on public.concierge_order_keepsakes;
create trigger set_concierge_order_keepsakes_updated_at
before update on public.concierge_order_keepsakes
for each row
execute function public.set_updated_at();

create index if not exists concierge_orders_customer_id_idx
  on public.concierge_orders (customer_id, created_at desc);

create index if not exists concierge_orders_status_idx
  on public.concierge_orders (status, created_at desc);

create index if not exists concierge_orders_package_key_idx
  on public.concierge_orders (package_key);

create index if not exists concierge_orders_archive_type_idx
  on public.concierge_orders (archive_type);

create index if not exists concierge_orders_memorial_deadline_idx
  on public.concierge_orders (memorial_deadline)
  where memorial_deadline is not null;

create index if not exists concierge_order_status_history_order_idx
  on public.concierge_order_status_history (concierge_order_id, created_at);

create index if not exists concierge_order_materials_order_idx
  on public.concierge_order_materials (concierge_order_id, created_at);

create index if not exists concierge_order_revisions_order_idx
  on public.concierge_order_revisions (concierge_order_id, created_at desc);

create index if not exists concierge_order_keepsakes_order_idx
  on public.concierge_order_keepsakes (concierge_order_id, created_at);

alter table public.concierge_orders enable row level security;
alter table public.concierge_order_status_history enable row level security;
alter table public.concierge_order_materials enable row level security;
alter table public.concierge_order_revisions enable row level security;
alter table public.concierge_order_keepsakes enable row level security;

revoke all on public.concierge_orders from anon, authenticated;
revoke all on public.concierge_order_status_history from anon, authenticated;
revoke all on public.concierge_order_materials from anon, authenticated;
revoke all on public.concierge_order_revisions from anon, authenticated;
revoke all on public.concierge_order_keepsakes from anon, authenticated;

grant select (
  id,
  order_number,
  customer_email,
  customer_name,
  customer_phone,
  archive_subject_name,
  archive_type,
  package_key,
  status,
  service_method,
  memorial_deadline,
  event_type,
  customer_notes,
  requested_item_count,
  received_item_count,
  included_revision_count,
  used_revision_count,
  is_rush,
  customer_approved_at,
  completed_at,
  created_at,
  updated_at
) on public.concierge_orders to authenticated;

grant insert (
  order_number,
  customer_id,
  customer_email,
  customer_name,
  customer_phone,
  archive_subject_name,
  archive_type,
  package_key,
  status,
  service_method,
  memorial_deadline,
  event_type,
  customer_notes,
  requested_item_count,
  included_revision_count,
  is_rush
) on public.concierge_orders to authenticated;

grant select (
  id,
  concierge_order_id,
  previous_status,
  new_status,
  customer_visible,
  note,
  created_at
) on public.concierge_order_status_history to authenticated;

grant select (
  id,
  concierge_order_id,
  material_type,
  original_name,
  quantity,
  customer_description,
  received_at,
  returned_at,
  created_at,
  updated_at
) on public.concierge_order_materials to authenticated;

grant select (
  id,
  concierge_order_id,
  requested_by,
  request_text,
  status,
  resolved_at,
  created_at
) on public.concierge_order_revisions to authenticated;

grant insert (
  concierge_order_id,
  requested_by,
  request_text,
  status
) on public.concierge_order_revisions to authenticated;

grant select (
  id,
  concierge_order_id,
  keepsake_type,
  quantity,
  engraving_text,
  production_status,
  tracking_number,
  created_at,
  updated_at
) on public.concierge_order_keepsakes to authenticated;

drop policy if exists "Customers can read own concierge orders" on public.concierge_orders;
create policy "Customers can read own concierge orders"
on public.concierge_orders
for select
to authenticated
using (customer_id = auth.uid());

drop policy if exists "Customers can create own concierge orders" on public.concierge_orders;
create policy "Customers can create own concierge orders"
on public.concierge_orders
for insert
to authenticated
with check (
  customer_id = auth.uid()
  and status in ('inquiry', 'awaiting_payment')
  and assigned_admin_id is null
  and archive_id is null
  and stripe_checkout_session_id is null
  and stripe_payment_intent_id is null
  and stripe_customer_id is null
  and amount_paid is null
  and currency is null
  and internal_notes is null
  and received_item_count = 0
  and used_revision_count = 0
  and customer_approved_at is null
  and completed_at is null
  and canceled_at is null
);

drop policy if exists "Customers can read own concierge status history" on public.concierge_order_status_history;
create policy "Customers can read own concierge status history"
on public.concierge_order_status_history
for select
to authenticated
using (
  customer_visible = true
  and exists (
    select 1
    from public.concierge_orders
    where concierge_orders.id = concierge_order_status_history.concierge_order_id
      and concierge_orders.customer_id = auth.uid()
  )
);

drop policy if exists "Customers can read own concierge materials" on public.concierge_order_materials;
create policy "Customers can read own concierge materials"
on public.concierge_order_materials
for select
to authenticated
using (
  exists (
    select 1
    from public.concierge_orders
    where concierge_orders.id = concierge_order_materials.concierge_order_id
      and concierge_orders.customer_id = auth.uid()
  )
);

drop policy if exists "Customers can read own concierge revisions" on public.concierge_order_revisions;
create policy "Customers can read own concierge revisions"
on public.concierge_order_revisions
for select
to authenticated
using (
  exists (
    select 1
    from public.concierge_orders
    where concierge_orders.id = concierge_order_revisions.concierge_order_id
      and concierge_orders.customer_id = auth.uid()
  )
);

drop policy if exists "Customers can create own concierge revision requests" on public.concierge_order_revisions;
create policy "Customers can create own concierge revision requests"
on public.concierge_order_revisions
for insert
to authenticated
with check (
  requested_by = auth.uid()
  and status = 'requested'
  and resolved_by is null
  and resolved_at is null
  and exists (
    select 1
    from public.concierge_orders
    where concierge_orders.id = concierge_order_revisions.concierge_order_id
      and concierge_orders.customer_id = auth.uid()
  )
);

drop policy if exists "Customers can read own concierge keepsakes" on public.concierge_order_keepsakes;
create policy "Customers can read own concierge keepsakes"
on public.concierge_order_keepsakes
for select
to authenticated
using (
  exists (
    select 1
    from public.concierge_orders
    where concierge_orders.id = concierge_order_keepsakes.concierge_order_id
      and concierge_orders.customer_id = auth.uid()
  )
);
