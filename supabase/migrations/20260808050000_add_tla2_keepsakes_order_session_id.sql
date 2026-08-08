-- Additive migration: Add stripe_session_id & stripe_item_index to public.keepsakes for deterministic order session anchoring
alter table public.keepsakes
  add column if not exists stripe_session_id text,
  add column if not exists stripe_item_index integer default 0;

-- Partial Unique Index: Ensures deterministic physical-item idempotency per Stripe session
create unique index if not exists keepsakes_stripe_session_item_idx
  on public.keepsakes (stripe_session_id, stripe_item_index)
  where stripe_session_id is not null and stripe_item_index is not null;

-- Partial Unique Index: Ensures public keepsake_code uniqueness across physical items
create unique index if not exists keepsakes_keepsake_code_unique_idx
  on public.keepsakes (keepsake_code)
  where keepsake_code is not null;
