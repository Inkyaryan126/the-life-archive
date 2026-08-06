try {
  require("server-only");
} catch {
  // Ignored in ts-node/tsx test runners.
}

import type { SupabaseClient } from "@supabase/supabase-js";
import { getAccountContext } from "@/lib/account";
import {
  ArchiveConciergeError,
  type AdminConciergeOrderSummary
} from "@/lib/archive-concierge";
import {
  archiveConciergePaidAddons,
  getArchiveConciergePackage,
  type ArchiveConciergePaymentModel,
  type ArchiveConciergePaymentStatus
} from "@/lib/archive-concierge-config";
import {
  getMemorialPriorityAvailability,
  getPackageCheckoutAvailability,
  isMemorialPriorityEligible,
  isOrderPayable
} from "@/lib/archive-concierge-payment-rules";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  resolveStripePriceId,
  validateStripeModeAndSecretKey
} from "@/lib/stripe-checkout-config";

type AdminClient = SupabaseClient<any, "public", any>;

export type StripeCheckoutSession = {
  id: string;
  object?: "checkout.session";
  url?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  customer?: string | null;
  customer_email?: string | null;
  customer_details?: { email?: string | null } | null;
  expires_at?: number | null;
  livemode?: boolean;
  metadata?: Record<string, string | undefined> | null;
  payment_intent?: string | null;
  payment_status?: string | null;
  status?: string | null;
};

export type StripeWebhookEvent = {
  id?: string;
  type: string;
  data: {
    object: StripeCheckoutSession & {
      metadata?: Record<string, string | undefined> | null;
      payment_intent?: string | null;
      amount_refunded?: number | null;
      currency?: string | null;
    };
  };
};

const protectedWorkflowStatuses = new Set([
  "completed",
  "canceled",
  "in_production",
  "customer_review",
  "approved"
]);

function getAdminClient() {
  return createAdminClient() as AdminClient;
}

function getSiteOrigin(request: Request) {
  const { origin } = new URL(request.url);
  return process.env.NEXT_PUBLIC_SITE_URL || origin;
}

function getPublicSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || null;
}

function toIsoFromStripeSeconds(value?: number | null) {
  return value ? new Date(value * 1000).toISOString() : null;
}

export {
  getMemorialPriorityAvailability,
  getPackageCheckoutAvailability,
  isMemorialPriorityEligible,
  isOrderPayable
} from "@/lib/archive-concierge-payment-rules";

async function fetchStripeCheckoutSession(sessionId: string, secretKey: string) {
  const response = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`
      }
    }
  );

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as StripeCheckoutSession;
}

async function createStripeCheckoutSession(input: {
  order: AdminConciergeOrderSummary;
  secretKey: string;
  origin: string;
  packagePriceId: string;
  memorialPriorityPriceId: string | null;
  includeMemorialPriority: boolean;
}) {
  const { order, secretKey, origin, packagePriceId } = input;
  const pkg = getArchiveConciergePackage(order.packageKey);
  if (!pkg) {
    throw new ArchiveConciergeError("invalid_package", "Choose a valid package.");
  }

  const body = new URLSearchParams({
    mode: "payment",
    success_url: `${origin}/archive-concierge/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/archive-concierge/checkout/cancel?order=${encodeURIComponent(order.id)}`,
    client_reference_id: order.id,
    "line_items[0][quantity]": "1",
    "line_items[0][price]": packagePriceId,
    "metadata[product_type]": "archive_concierge",
    "metadata[concierge_order_id]": order.id,
    "metadata[order_number]": order.orderNumber,
    "metadata[package_key]": order.packageKey,
    "metadata[archive_type]": order.archiveType,
    "metadata[payment_model]": pkg.paymentModel,
    "metadata[customer_id]": order.customerId ?? "",
    "metadata[memorial_priority]": input.includeMemorialPriority ? "true" : "false"
  });

  if (input.includeMemorialPriority && input.memorialPriorityPriceId) {
    body.set("line_items[1][quantity]", "1");
    body.set("line_items[1][price]", input.memorialPriorityPriceId);
  }

  if (order.customerEmail) {
    body.set("customer_email", order.customerEmail);
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    throw new ArchiveConciergeError(
      "database_error",
      "Checkout could not start. Please try again."
    );
  }

  const session = (await response.json()) as StripeCheckoutSession;
  if (!session.id || !session.url) {
    throw new ArchiveConciergeError(
      "database_error",
      "Checkout could not start. Please try again."
    );
  }

  return session;
}

async function loadAdminOrder(orderId: string) {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("concierge_orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    throw new ArchiveConciergeError("database_error", error.message);
  }

  if (!data) {
    throw new ArchiveConciergeError("not_found", "Order was not found.");
  }

  return {
    id: data.id,
    orderNumber: data.order_number,
    customerId: data.customer_id ?? null,
    customerName: data.customer_name,
    customerEmail: data.customer_email,
    archiveSubjectName: data.archive_subject_name,
    archiveType: data.archive_type,
    packageKey: data.package_key,
    status: data.status,
    paymentStatus: data.payment_status ?? "not_started",
    paymentModel: data.payment_model ?? "full",
    memorialDeadline: data.memorial_deadline ?? null,
    eventType: data.event_type ?? null,
    stripeCheckoutSessionId: data.stripe_checkout_session_id ?? null,
    stripePaymentIntentId: data.stripe_payment_intent_id ?? null,
    stripeCustomerId: data.stripe_customer_id ?? null,
    amountPaid: data.amount_paid ?? null,
    currency: data.currency ?? null,
    paidAt: data.paid_at ?? null,
    paymentConfirmationSentAt: data.payment_confirmation_sent_at ?? null,
    memorialPriorityPurchased: Boolean(data.memorial_priority_purchased),
    lastPaymentEventId: data.last_payment_event_id ?? null
  } as AdminConciergeOrderSummary;
}

export async function createArchiveConciergeCheckout(input: {
  orderId: string;
  includeMemorialPriority: boolean;
  request: Request;
}) {
  const account = await getAccountContext();
  if (!account.user) {
    throw new ArchiveConciergeError("authentication_required", "Sign in required.");
  }

  const order = await loadAdminOrder(input.orderId);
  if (order.customerId !== account.user.id) {
    throw new ArchiveConciergeError("not_found", "Order was not found.");
  }

  if (!isOrderPayable(order)) {
    return { redirectUrl: `/dashboard/concierge/${order.id}` };
  }

  const pkg = getArchiveConciergePackage(order.packageKey);
  if (!pkg || !pkg.active || !pkg.checkoutEnabled) {
    throw new ArchiveConciergeError("invalid_package", "Checkout is not active.");
  }

  const modeKey = validateStripeModeAndSecretKey(process.env);
  if (!modeKey.ok) {
    console.error(modeKey.logMessage);
    throw new ArchiveConciergeError("database_error", modeKey.error);
  }

  const packagePrice = resolveStripePriceId(pkg.stripePriceEnv, pkg.displayName, process.env);
  if (!packagePrice.ok) {
    console.error(packagePrice.logMessage);
    throw new ArchiveConciergeError("database_error", packagePrice.error);
  }

  const wantsMemorialPriority = Boolean(input.includeMemorialPriority);
  const memorialPriorityAllowed = isMemorialPriorityEligible(order);
  if (wantsMemorialPriority && !memorialPriorityAllowed) {
    throw new ArchiveConciergeError(
      "invalid_deadline",
      "Memorial Priority is only available for memorial orders with a deadline or event."
    );
  }

  let memorialPriorityPriceId: string | null = null;
  if (wantsMemorialPriority) {
    const addon = archiveConciergePaidAddons.memorial_priority;
    const addonPrice = resolveStripePriceId(
      addon.stripePriceEnv,
      addon.displayName,
      process.env
    );
    if (!addonPrice.ok) {
      console.error(addonPrice.logMessage);
      throw new ArchiveConciergeError("database_error", addonPrice.error);
    }
    memorialPriorityPriceId = addonPrice.priceId;
  }

  if (order.stripeCheckoutSessionId && order.paymentStatus === "checkout_pending") {
    const existing = await fetchStripeCheckoutSession(
      order.stripeCheckoutSessionId,
      modeKey.secretKey
    );
    if (
      existing?.url &&
      existing.status !== "complete" &&
      existing.metadata?.concierge_order_id === order.id
    ) {
      return { redirectUrl: existing.url };
    }
  }

  const origin = getSiteOrigin(input.request);
  const session = await createStripeCheckoutSession({
    order,
    secretKey: modeKey.secretKey,
    origin,
    packagePriceId: packagePrice.priceId,
    memorialPriorityPriceId,
    includeMemorialPriority: wantsMemorialPriority
  });

  const supabase = getAdminClient();
  const previousStatus = order.status;
  const nextWorkflowStatus =
    order.status === "inquiry" ? "awaiting_payment" : order.status;

  const { error } = await supabase
    .from("concierge_orders")
    .update({
      status: nextWorkflowStatus,
      payment_status: "checkout_pending",
      payment_model: pkg.paymentModel,
      stripe_checkout_session_id: session.id,
      stripe_checkout_expires_at: toIsoFromStripeSeconds(session.expires_at ?? null),
      checkout_started_at: new Date().toISOString()
    })
    .eq("id", order.id)
    .eq("customer_id", account.user.id);

  if (error) {
    throw new ArchiveConciergeError("database_error", error.message);
  }

  if (nextWorkflowStatus !== previousStatus) {
    await supabase.from("concierge_order_status_history").insert({
      concierge_order_id: order.id,
      previous_status: previousStatus,
      new_status: nextWorkflowStatus,
      changed_by: account.user.id,
      customer_visible: true,
      note: "Checkout started for Archive Concierge."
    });
  }

  return { redirectUrl: session.url as string };
}

export async function verifyArchiveConciergeCheckoutSuccess(input: {
  sessionId: string;
}) {
  const account = await getAccountContext();
  if (!account.user) {
    throw new ArchiveConciergeError("authentication_required", "Sign in required.");
  }

  const modeKey = validateStripeModeAndSecretKey(process.env);
  if (!modeKey.ok) {
    console.error(modeKey.logMessage);
    throw new ArchiveConciergeError("database_error", modeKey.error);
  }

  const session = await fetchStripeCheckoutSession(input.sessionId, modeKey.secretKey);
  if (!session || session.metadata?.product_type !== "archive_concierge") {
    throw new ArchiveConciergeError("not_found", "Checkout session was not found.");
  }

  const orderId = session.metadata.concierge_order_id;
  if (!orderId) {
    throw new ArchiveConciergeError("not_found", "Checkout session was not found.");
  }

  const order = await loadAdminOrder(orderId);
  if (order.customerId !== account.user.id) {
    throw new ArchiveConciergeError("not_found", "Checkout session was not found.");
  }

  if (
    order.stripeCheckoutSessionId &&
    order.stripeCheckoutSessionId !== session.id
  ) {
    throw new ArchiveConciergeError("not_found", "Checkout session was not found.");
  }

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    paymentStatus: order.paymentStatus,
    sessionPaymentStatus: session.payment_status ?? null,
    processing:
      session.payment_status === "paid" &&
      order.paymentStatus !== "paid" &&
      order.paymentStatus !== "deposit_paid"
  };
}

function validateConciergeMetadata(session: StripeCheckoutSession) {
  const metadata = session.metadata ?? {};
  if (metadata.product_type !== "archive_concierge") {
    return null;
  }

  const orderId = metadata.concierge_order_id;
  const packageKey = metadata.package_key;
  const paymentModel = metadata.payment_model as ArchiveConciergePaymentModel | undefined;

  if (!orderId || !packageKey || (paymentModel !== "full" && paymentModel !== "deposit")) {
    throw new ArchiveConciergeError("database_error", "Malformed Concierge metadata.");
  }

  return {
    orderId,
    packageKey,
    paymentModel,
    memorialPriority: metadata.memorial_priority === "true"
  };
}

function nextPaidWorkflowStatus(currentStatus: string) {
  if (protectedWorkflowStatuses.has(currentStatus)) {
    return currentStatus;
  }
  return "paid";
}

async function sendPaymentConfirmationEmail(order: AdminConciergeOrderSummary) {
  if (order.paymentConfirmationSentAt) {
    return;
  }

  const siteUrl = getPublicSiteUrl();
  const orderUrl = siteUrl
    ? `${siteUrl}/dashboard/concierge/${order.id}`
    : "/dashboard/concierge";
  const pkg = getArchiveConciergePackage(order.packageKey);
  const paymentCopy =
    order.paymentModel === "deposit"
      ? "Your project deposit has been received. The final project total will be determined after collection review."
      : "Your Archive Concierge payment has been received.";
  const priorityCopy = order.memorialPriorityPurchased
    ? " Memorial Priority Service is noted on the order and will be reviewed against your materials, deadline, project size, and scheduling availability."
    : "";

  try {
    const { sendEmail } = await import("@/lib/resend-email");
    await sendEmail({
      to: order.customerEmail,
      subject: `Archive Concierge payment confirmed for ${order.orderNumber}`,
      idempotencyKey: `archive-concierge-payment-${order.id}`,
      text: [
        `Hi ${order.customerName},`,
        "",
        paymentCopy + priorityCopy,
        "",
        `Order: ${order.orderNumber}`,
        `Archive subject: ${order.archiveSubjectName}`,
        `Package: ${pkg?.displayName ?? order.packageKey}`,
        "",
        "Next steps: prepare your photos, videos, recordings, documents, drives, and notes. Upload and drop-off instructions will appear in your order dashboard as the project is reviewed.",
        "Please keep original copies of digital files. Nothing is published before your approval.",
        "",
        `View your order: ${orderUrl}`
      ].join("\n"),
      html: `
        <p>Hi ${order.customerName},</p>
        <p>${paymentCopy}${priorityCopy}</p>
        <p><strong>Order:</strong> ${order.orderNumber}<br />
        <strong>Archive subject:</strong> ${order.archiveSubjectName}<br />
        <strong>Package:</strong> ${pkg?.displayName ?? order.packageKey}</p>
        <p>Next steps: prepare your photos, videos, recordings, documents, drives, and notes. Upload and drop-off instructions will appear in your order dashboard as the project is reviewed.</p>
        <p>Please keep original copies of digital files. Nothing is published before your approval.</p>
        <p><a href="${orderUrl}">View your Archive Concierge order</a></p>
      `
    });

    await getAdminClient()
      .from("concierge_orders")
      .update({ payment_confirmation_sent_at: new Date().toISOString() })
      .eq("id", order.id)
      .is("payment_confirmation_sent_at", null);
  } catch (error) {
    console.error("Archive Concierge payment confirmation email failed", {
      orderId: order.id,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

export async function processArchiveConciergeStripeEvent(event: StripeWebhookEvent) {
  const session = event.data.object;
  const metadata = validateConciergeMetadata(session);
  if (!metadata) {
    return { handled: false };
  }

  const order = await loadAdminOrder(metadata.orderId);
  if (order.lastPaymentEventId === event.id) {
    return { handled: true, duplicate: true };
  }
  if (order.packageKey !== metadata.packageKey) {
    throw new ArchiveConciergeError("database_error", "Concierge package metadata mismatch.");
  }
  if (
    order.stripeCheckoutSessionId &&
    session.id &&
    order.stripeCheckoutSessionId !== session.id
  ) {
    throw new ArchiveConciergeError("database_error", "Concierge checkout session mismatch.");
  }

  const supabase = getAdminClient();
  const now = new Date().toISOString();

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    if (session.payment_status && session.payment_status !== "paid") {
      return { handled: true, pending: true };
    }

    const paymentStatus: ArchiveConciergePaymentStatus =
      metadata.paymentModel === "deposit" ? "deposit_paid" : "paid";
    const nextStatus = nextPaidWorkflowStatus(order.status);
    const amountPaid = session.amount_total ?? order.amountPaid ?? 0;
    const currency = session.currency ?? order.currency ?? "usd";

    const { error } = await supabase
      .from("concierge_orders")
      .update({
        status: nextStatus,
        payment_status: paymentStatus,
        payment_model: metadata.paymentModel,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent ?? order.stripePaymentIntentId,
        stripe_customer_id: session.customer ?? order.stripeCustomerId,
        amount_paid: amountPaid,
        total_amount_paid: amountPaid,
        deposit_amount_paid: metadata.paymentModel === "deposit" ? amountPaid : null,
        currency,
        payment_currency: currency,
        paid_at: order.paidAt ?? now,
        memorial_priority_purchased: metadata.memorialPriority,
        memorial_priority_amount: metadata.memorialPriority ? null : order.memorialPriorityAmount,
        last_payment_event_id: event.id ?? order.lastPaymentEventId
      })
      .eq("id", order.id);

    if (error) {
      throw new ArchiveConciergeError("database_error", error.message);
    }

    if (
      order.paymentStatus !== paymentStatus ||
      (!protectedWorkflowStatuses.has(order.status) && order.status !== nextStatus)
    ) {
      await supabase.from("concierge_order_status_history").insert({
        concierge_order_id: order.id,
        previous_status: order.status,
        new_status: nextStatus,
        changed_by: null,
        customer_visible: true,
        note:
          metadata.paymentModel === "deposit"
            ? "Archive Concierge project deposit confirmed."
            : "Archive Concierge payment confirmed."
      });
    }

    await sendPaymentConfirmationEmail({
      ...order,
      status: nextStatus as any,
      paymentStatus,
      paymentModel: metadata.paymentModel,
      amountPaid,
      totalAmountPaid: amountPaid,
      depositAmountPaid: metadata.paymentModel === "deposit" ? amountPaid : null,
      currency,
      paymentCurrency: currency,
      paidAt: order.paidAt ?? now,
      memorialPriorityPurchased: metadata.memorialPriority
    } as AdminConciergeOrderSummary);

    return { handled: true, paymentStatus };
  }

  if (
    event.type === "checkout.session.async_payment_failed" ||
    event.type === "payment_intent.payment_failed"
  ) {
    const { error } = await supabase
      .from("concierge_orders")
      .update({
        payment_status: "payment_failed",
        last_payment_event_id: event.id ?? order.lastPaymentEventId
      })
      .eq("id", order.id);

    if (error) {
      throw new ArchiveConciergeError("database_error", error.message);
    }

    await supabase.from("concierge_order_status_history").insert({
      concierge_order_id: order.id,
      previous_status: order.status,
      new_status: order.status,
      changed_by: null,
      customer_visible: true,
      note: "Payment was not completed. You can retry checkout from this order."
    });

    return { handled: true, paymentStatus: "payment_failed" };
  }

  if (event.type === "charge.refunded") {
    const { error } = await supabase
      .from("concierge_orders")
      .update({
        payment_status: "refunded",
        last_payment_event_id: event.id ?? order.lastPaymentEventId
      })
      .eq("id", order.id);

    if (error) {
      throw new ArchiveConciergeError("database_error", error.message);
    }

    await supabase.from("concierge_order_status_history").insert({
      concierge_order_id: order.id,
      previous_status: order.status,
      new_status: order.status,
      changed_by: null,
      customer_visible: true,
      note: "A refund was recorded for this Archive Concierge payment."
    });

    return { handled: true, paymentStatus: "refunded" };
  }

  return { handled: true, ignored: true };
}
