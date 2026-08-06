-- Archive Concierge Phase 2 payment state.
-- Adds Stripe Checkout/payment tracking without changing existing keepsake checkout behavior.

alter table public.concierge_orders
  add column if not exists payment_status text not null default 'not_started',
  add column if not exists payment_model text not null default 'full',
  add column if not exists deposit_amount_paid integer,
  add column if not exists total_amount_paid integer,
  add column if not exists balance_due integer,
  add column if not exists checkout_started_at timestamptz,
  add column if not exists paid_at timestamptz,
  add column if not exists stripe_checkout_expires_at timestamptz,
  add column if not exists memorial_priority_purchased boolean not null default false,
  add column if not exists memorial_priority_amount integer,
  add column if not exists last_payment_event_id text,
  add column if not exists payment_currency text,
  add column if not exists payment_confirmation_sent_at timestamptz;

alter table public.concierge_orders
  drop constraint if exists concierge_orders_payment_status_check,
  add constraint concierge_orders_payment_status_check
    check (payment_status in (
      'not_started',
      'checkout_pending',
      'paid',
      'deposit_paid',
      'payment_failed',
      'refunded',
      'partially_refunded',
      'canceled'
    ));

alter table public.concierge_orders
  drop constraint if exists concierge_orders_payment_model_check,
  add constraint concierge_orders_payment_model_check
    check (payment_model in ('full', 'deposit'));

alter table public.concierge_orders
  drop constraint if exists concierge_orders_payment_amounts_check,
  add constraint concierge_orders_payment_amounts_check
    check (
      (deposit_amount_paid is null or deposit_amount_paid >= 0)
      and (total_amount_paid is null or total_amount_paid >= 0)
      and (balance_due is null or balance_due >= 0)
      and (memorial_priority_amount is null or memorial_priority_amount >= 0)
    );

alter table public.concierge_orders
  drop constraint if exists concierge_orders_payment_currency_check,
  add constraint concierge_orders_payment_currency_check
    check (
      payment_currency is null
      or payment_currency ~ '^[a-z]{3}$'
    );

create index if not exists concierge_orders_payment_status_idx
  on public.concierge_orders (payment_status, created_at desc);

create index if not exists concierge_orders_last_payment_event_id_idx
  on public.concierge_orders (last_payment_event_id)
  where last_payment_event_id is not null;

grant select (
  payment_status,
  payment_model,
  deposit_amount_paid,
  total_amount_paid,
  balance_due,
  amount_paid,
  currency,
  checkout_started_at,
  paid_at,
  memorial_priority_purchased,
  memorial_priority_amount,
  payment_currency,
  payment_confirmation_sent_at
) on public.concierge_orders to authenticated;
