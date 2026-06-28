import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export const fulfillmentStatuses = [
  "New",
  "Needs Personalization",
  "In Production",
  "Shipped",
  "Completed"
] as const;

export type FulfillmentStatus = (typeof fulfillmentStatuses)[number];

export type KeepsakeOrder = {
  id: string;
  stripeSessionId: string;
  customerEmail: string | null;
  productName: string;
  amountPaid: number;
  currency: string;
  paymentStatus: string;
  fulfillmentStatus: FulfillmentStatus;
  archiveSlug: string | null;
  notes: string;
  stripeSessionUrl: string | null;
  createdAt: string;
};

type KeepsakeOrderRow = {
  id: string;
  stripe_session_id: string;
  customer_email: string | null;
  product_name: string;
  amount_paid: number;
  currency: string;
  payment_status: string;
  fulfillment_status: FulfillmentStatus;
  archive_slug: string | null;
  notes: string | null;
  stripe_session_url: string | null;
  created_at: string;
};

function getOrderClient() {
  return createAdminClient() as SupabaseClient<any, "public", any>;
}

export function isFulfillmentStatus(value: string): value is FulfillmentStatus {
  return fulfillmentStatuses.includes(value as FulfillmentStatus);
}

function mapOrder(row: KeepsakeOrderRow): KeepsakeOrder {
  return {
    id: row.id,
    stripeSessionId: row.stripe_session_id,
    customerEmail: row.customer_email,
    productName: row.product_name,
    amountPaid: row.amount_paid,
    currency: row.currency,
    paymentStatus: row.payment_status,
    fulfillmentStatus: row.fulfillment_status,
    archiveSlug: row.archive_slug,
    notes: row.notes ?? "",
    stripeSessionUrl: row.stripe_session_url,
    createdAt: row.created_at
  };
}

export async function listKeepsakeOrders() {
  const supabase = getOrderClient();
  const { data, error } = await supabase
    .from("keepsake_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as KeepsakeOrderRow[]).map(mapOrder);
}

export async function upsertKeepsakeOrder(input: {
  stripeSessionId: string;
  customerEmail: string | null;
  productName: string;
  amountPaid: number;
  currency: string;
  paymentStatus: string;
  archiveSlug: string | null;
  stripeSessionUrl: string | null;
}) {
  const supabase = getOrderClient();
  const { error } = await supabase.from("keepsake_orders").upsert(
    {
      stripe_session_id: input.stripeSessionId,
      customer_email: input.customerEmail,
      product_name: input.productName,
      amount_paid: input.amountPaid,
      currency: input.currency,
      payment_status: input.paymentStatus,
      archive_slug: input.archiveSlug,
      stripe_session_url: input.stripeSessionUrl
    },
    { onConflict: "stripe_session_id" }
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateKeepsakeOrder(input: {
  orderId: string;
  fulfillmentStatus: FulfillmentStatus;
  notes: string;
}) {
  const supabase = getOrderClient();
  const { error } = await supabase
    .from("keepsake_orders")
    .update({
      fulfillment_status: input.fulfillmentStatus,
      notes: input.notes
    })
    .eq("id", input.orderId);

  if (error) {
    throw new Error(error.message);
  }
}
