-- Correct Archive Concierge customer SELECT grants.
-- RLS already limits customer reads to customer_id = auth.uid(); this migration
-- grants the authenticated role only the customer-safe columns needed by the
-- customer dashboard, its filters, and RLS policy predicates.

revoke select on public.concierge_orders from authenticated;
revoke select on public.concierge_order_status_history from authenticated;
revoke select on public.concierge_order_materials from authenticated;
revoke select on public.concierge_order_revisions from authenticated;
revoke select on public.concierge_order_keepsakes from authenticated;

grant select (
  id,
  customer_id,
  order_number,
  customer_email,
  customer_name,
  customer_phone,
  archive_subject_name,
  archive_type,
  package_key,
  status,
  payment_status,
  payment_model,
  service_method,
  memorial_deadline,
  event_type,
  customer_notes,
  requested_item_count,
  received_item_count,
  included_revision_count,
  used_revision_count,
  is_rush,
  amount_paid,
  currency,
  deposit_amount_paid,
  total_amount_paid,
  balance_due,
  checkout_started_at,
  paid_at,
  memorial_priority_purchased,
  memorial_priority_amount,
  payment_currency,
  payment_confirmation_sent_at,
  customer_approved_at,
  completed_at,
  created_at
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
  created_at
) on public.concierge_order_materials to authenticated;

grant select (
  id,
  concierge_order_id,
  request_text,
  status,
  resolved_at,
  created_at
) on public.concierge_order_revisions to authenticated;

grant select (
  id,
  concierge_order_id,
  keepsake_type,
  quantity,
  engraving_text,
  production_status,
  tracking_number,
  created_at
) on public.concierge_order_keepsakes to authenticated;
