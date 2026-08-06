import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  archiveConciergePaidAddons,
  archiveConciergePackages,
  archiveConciergePaymentStatuses
} from "../lib/archive-concierge-config";
import {
  getPackageCheckoutAvailability,
  isMemorialPriorityEligible,
  isOrderPayable
} from "../lib/archive-concierge-payment-rules";

const root = process.cwd();
const paymentLibPath = path.join(root, "lib/archive-concierge-payments.ts");
const configPath = path.join(root, "lib/archive-concierge-config.ts");
const checkoutRoutePath = path.join(root, "app/api/stripe/archive-concierge/checkout/route.ts");
const webhookPath = path.join(root, "app/api/stripe/webhook/route.ts");
const successPagePath = path.join(root, "app/archive-concierge/checkout/success/page.tsx");
const cancelPagePath = path.join(root, "app/archive-concierge/checkout/cancel/page.tsx");
const customerPagePath = path.join(root, "app/dashboard/concierge/[orderId]/page.tsx");
const adminPagePath = path.join(root, "app/admin/concierge/[orderId]/page.tsx");
const paymentMigrationPath = path.join(
  root,
  "supabase/migrations/20260805210000_add_archive_concierge_payments.sql"
);
const phase1MigrationPath = path.join(
  root,
  "supabase/migrations/20260805200000_create_archive_concierge.sql"
);

for (const file of [
  paymentLibPath,
  checkoutRoutePath,
  webhookPath,
  successPagePath,
  cancelPagePath,
  paymentMigrationPath,
  phase1MigrationPath
]) {
  assert.equal(fs.existsSync(file), true, `${file} must exist`);
}
assert.equal(
  fs.existsSync(path.join(root, "supabase/migrations/20260806120000_create_archive_concierge.sql")),
  false,
  "renamed Phase 1 migration must not leave a duplicate"
);

const paymentLib = fs.readFileSync(paymentLibPath, "utf8");
const paymentRules = fs.readFileSync(path.join(root, "lib/archive-concierge-payment-rules.ts"), "utf8");
const config = fs.readFileSync(configPath, "utf8");
const checkoutRoute = fs.readFileSync(checkoutRoutePath, "utf8");
const webhook = fs.readFileSync(webhookPath, "utf8");
const successPage = fs.readFileSync(successPagePath, "utf8");
const cancelPage = fs.readFileSync(cancelPagePath, "utf8");
const customerPage = fs.readFileSync(customerPagePath, "utf8");
const adminPage = fs.readFileSync(adminPagePath, "utf8");
const migration = fs.readFileSync(paymentMigrationPath, "utf8");

// Package/payment configuration.
assert.equal(archiveConciergePackages.essential.paymentModel, "full");
assert.equal(archiveConciergePackages.legacy.paymentModel, "full");
assert.equal(archiveConciergePackages.family_legacy.paymentModel, "full");
assert.equal(archiveConciergePackages.custom.paymentModel, "deposit");
assert.equal(archiveConciergePackages.custom.requiresQuote, true);
assert.equal(
  archiveConciergePackages.custom.stripePriceEnv,
  "STRIPE_ARCHIVE_CONCIERGE_CUSTOM_DEPOSIT_PRICE_ID"
);
assert.equal(
  archiveConciergePaidAddons.memorial_priority.stripePriceEnv,
  "STRIPE_ARCHIVE_CONCIERGE_MEMORIAL_PRIORITY_PRICE_ID"
);
assert.equal(
  getPackageCheckoutAvailability("legacy", {}).configured,
  false,
  "missing optional Concierge price IDs must not throw"
);
assert.equal(
  getPackageCheckoutAvailability("legacy", {
    STRIPE_ARCHIVE_CONCIERGE_LEGACY_PRICE_ID: "price_123"
  }).configured,
  true
);
assert.match(config, /stripePriceEnv/);
assert.doesNotMatch(config, /price_[A-Za-z0-9]{8,}/);

// Server-side checkout safeguards.
assert.match(checkoutRoute, /request\.formData\(\)/);
assert.match(checkoutRoute, /orderId/);
assert.doesNotMatch(checkoutRoute, /priceId|amountPaid|amount_total/);
assert.match(paymentLib, /order\.customerId !== account\.user\.id/);
assert.match(paymentLib, /isOrderPayable\(order\)/);
assert.match(paymentRules, /order\.status === "canceled" \|\| order\.status === "completed"/);
assert.match(paymentLib, /resolveStripePriceId\(pkg\.stripePriceEnv/);
assert.match(paymentLib, /validateStripeModeAndSecretKey\(process\.env\)/);
assert.match(paymentLib, /stripeCheckoutSessionId/);
assert.match(paymentLib, /payment_status: "checkout_pending"/);
assert.match(paymentLib, /client_reference_id: order\.id/);
for (const metadataKey of [
  "product_type",
  "concierge_order_id",
  "order_number",
  "package_key",
  "archive_type",
  "payment_model",
  "customer_id",
  "memorial_priority"
]) {
  assert.match(paymentLib, new RegExp(`metadata\\[${metadataKey}\\]`));
}

// Memorial Priority is decided from saved order shape.
assert.equal(
  isMemorialPriorityEligible({
    archiveType: "memorial",
    memorialDeadline: "2026-09-10T12:00:00.000Z",
    eventType: null
  }),
  true
);
assert.equal(
  isMemorialPriorityEligible({
    archiveType: "memorial",
    memorialDeadline: null,
    eventType: "Celebration of life"
  }),
  true
);
assert.equal(
  isMemorialPriorityEligible({
    archiveType: "living",
    memorialDeadline: "2026-09-10T12:00:00.000Z",
    eventType: null
  }),
  false
);
assert.equal(
  isMemorialPriorityEligible({
    archiveType: "memorial",
    memorialDeadline: null,
    eventType: null
  }),
  false
);
assert.match(paymentLib, /wantsMemorialPriority && !memorialPriorityAllowed/);

// Paid/canceled order protection.
assert.equal(isOrderPayable({ status: "inquiry", paymentStatus: "not_started" }), true);
assert.equal(isOrderPayable({ status: "canceled", paymentStatus: "not_started" }), false);
assert.equal(isOrderPayable({ status: "completed", paymentStatus: "not_started" }), false);
assert.equal(isOrderPayable({ status: "inquiry", paymentStatus: "paid" }), false);
assert.equal(isOrderPayable({ status: "inquiry", paymentStatus: "deposit_paid" }), false);

// Success/cancel pages.
assert.match(successPage, /verifyArchiveConciergeCheckoutSuccess/);
assert.match(successPage, /does not mark an order paid\s+from the URL alone/);
assert.doesNotMatch(successPage, /update\(|payment_status: "paid"|deposit_paid/);
assert.match(cancelPage, /No completed payment was recorded/);
assert.match(cancelPage, /without creating a new order/);

// Webhook extension preserves signature verification and scopes Concierge by metadata.
assert.match(webhook, /verifyStripeSignature\(payload, signature, webhookSecret\)/);
assert.match(webhook, /metadata\?\.product_type === "archive_concierge"/);
assert.match(webhook, /processArchiveConciergeStripeEvent/);
assert.match(webhook, /checkout\.session\.completed/);
assert.match(webhook, /checkout\.session\.async_payment_succeeded/);
assert.match(webhook, /checkout\.session\.async_payment_failed/);
assert.match(webhook, /payment_intent\.payment_failed/);
assert.match(webhook, /charge\.refunded/);
assert.match(paymentLib, /order\.lastPaymentEventId === event\.id/);
assert.match(paymentLib, /order\.packageKey !== metadata\.packageKey/);
assert.match(paymentLib, /stripeCheckoutSessionId !== session\.id/);
assert.match(paymentLib, /protectedWorkflowStatuses/);
assert.match(paymentLib, /paymentStatus: ArchiveConciergePaymentStatus/);
assert.match(paymentLib, /metadata\.paymentModel === "deposit" \? "deposit_paid" : "paid"/);
assert.match(paymentLib, /payment_confirmation_sent_at/);
assert.match(paymentLib, /catch \(error\)[\s\S]*payment confirmation email failed/);

// Customer/admin UI states and field exposure.
assert.match(customerPage, /Project Deposit/);
assert.match(customerPage, /Continue to Secure Checkout/);
assert.match(customerPage, /Memorial Priority Service/);
assert.match(customerPage, /does not publish the\s+archive automatically/);
assert.match(customerPage, /paymentStatus/);
assert.doesNotMatch(customerPage, /stripeCheckoutSessionId|stripePaymentIntentId|stripeCustomerId|lastPaymentEventId/);
assert.match(adminPage, /Payment status/);
assert.match(adminPage, /Checkout configured/);
assert.match(adminPage, /Raw Stripe IDs are intentionally omitted/);

// Migration constraints and safe customer grants.
for (const status of archiveConciergePaymentStatuses) {
  assert.match(migration, new RegExp(`'${status}'`));
}
for (const column of [
  "payment_status",
  "payment_model",
  "deposit_amount_paid",
  "total_amount_paid",
  "balance_due",
  "checkout_started_at",
  "paid_at",
  "stripe_checkout_expires_at",
  "memorial_priority_purchased",
  "memorial_priority_amount",
  "last_payment_event_id",
  "payment_currency",
  "payment_confirmation_sent_at"
]) {
  assert.match(migration, new RegExp(`add column if not exists ${column}`));
}
const customerGrant =
  migration.match(/grant select \([\s\S]*?\) on public\.concierge_orders to authenticated/)?.[0] ?? "";
assert.match(customerGrant, /payment_status/);
assert.match(customerGrant, /amount_paid/);
assert.doesNotMatch(
  customerGrant,
  /stripe_checkout_session_id|stripe_payment_intent_id|stripe_customer_id|last_payment_event_id/
);

console.log("archive-concierge-stripe tests passed cleanly!");
