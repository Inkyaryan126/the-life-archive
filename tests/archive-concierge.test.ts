import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  archiveConciergeFutureStripeEnvNames,
  archiveConciergePackages,
  archiveConciergeStatuses,
  getArchiveConciergePackage,
  getArchiveConciergePackageList,
  isArchiveConciergeStatus
} from "../lib/archive-concierge-config";
import {
  assertNoInternalCustomerFields,
  normalizeMemorialDeadline,
  validateArchiveConciergeIntake
} from "../lib/archive-concierge-validation";

const migrationPath = path.join(
  process.cwd(),
  "supabase/migrations/20260805200000_create_archive_concierge.sql"
);
const publicPagePath = path.join(process.cwd(), "app/archive-concierge/page.tsx");
const intakePagePath = path.join(process.cwd(), "app/archive-concierge/start/page.tsx");
const intakeActionsPath = path.join(process.cwd(), "app/archive-concierge/start/actions.ts");
const customerDashboardPath = path.join(process.cwd(), "app/dashboard/concierge/page.tsx");
const customerDetailPath = path.join(process.cwd(), "app/dashboard/concierge/[orderId]/page.tsx");
const adminPagePath = path.join(process.cwd(), "app/admin/concierge/page.tsx");
const adminDetailPath = path.join(process.cwd(), "app/admin/concierge/[orderId]/page.tsx");
const adminActionsPath = path.join(process.cwd(), "app/admin/concierge/actions.ts");
const domainPath = path.join(process.cwd(), "lib/archive-concierge.ts");
const navPath = path.join(process.cwd(), "components/archive-building/navigation.ts");

assert.equal(fs.existsSync(migrationPath), true, "Archive Concierge migration must exist");
assert.equal(fs.existsSync(publicPagePath), true, "Public Archive Concierge page must exist");
assert.equal(fs.existsSync(intakePagePath), true, "Archive Concierge intake page must exist");
assert.equal(fs.existsSync(customerDashboardPath), true, "Customer Concierge dashboard page must exist");
assert.equal(fs.existsSync(adminPagePath), true, "Admin Concierge page must exist");

const migration = fs.readFileSync(migrationPath, "utf8");
const publicPage = fs.readFileSync(publicPagePath, "utf8");
const intakePage = fs.readFileSync(intakePagePath, "utf8");
const intakeActions = fs.readFileSync(intakeActionsPath, "utf8");
const customerDashboard = fs.readFileSync(customerDashboardPath, "utf8");
const customerDetail = fs.readFileSync(customerDetailPath, "utf8");
const adminPage = fs.readFileSync(adminPagePath, "utf8");
const adminDetail = fs.readFileSync(adminDetailPath, "utf8");
const adminActions = fs.readFileSync(adminActionsPath, "utf8");
const domain = fs.readFileSync(domainPath, "utf8");
const nav = fs.readFileSync(navPath, "utf8");

// Package configuration
assert.equal(getArchiveConciergePackageList().length, 4);
assert.equal(archiveConciergePackages.essential.startingPriceText, "Starting at $249");
assert.equal(archiveConciergePackages.legacy.recommended, true);
assert.equal(archiveConciergePackages.family_legacy.includedItemCount, 400);
assert.equal(getArchiveConciergePackage("custom")?.displayName, "Custom Project");
assert.ok(
  archiveConciergeFutureStripeEnvNames.includes(
    "STRIPE_ARCHIVE_CONCIERGE_MEMORIAL_PRIORITY_PRICE_ID"
  ),
  "Future memorial priority Stripe env var must be prepared"
);

// Intake validation
const baseIntake = {
  customerName: "Ada Lovelace",
  customerEmail: "ADA@example.COM",
  customerPhone: "",
  archiveSubjectName: "Ada Lovelace",
  archiveType: "living",
  packageKey: "legacy",
  serviceMethod: "mixed",
  requestedItemCount: 120,
  hasMemorialDeadline: false,
  memorialDeadline: "",
  eventType: "",
  customerNotes: "Several boxes and a phone.",
  hasAuthority: true,
  retainedOriginals: true,
  approvalAcknowledged: true
};

const validIntake = validateArchiveConciergeIntake(baseIntake);
assert.equal(validIntake.customerEmail, "ada@example.com");
assert.equal(validIntake.packageKey, "legacy");
assert.equal(validIntake.status, "inquiry");
assert.equal(validIntake.includedRevisionCount, 2);

assert.throws(
  () => validateArchiveConciergeIntake({ ...baseIntake, packageKey: "fake" }),
  /valid package/
);
assert.throws(
  () => validateArchiveConciergeIntake({ ...baseIntake, hasAuthority: false }),
  /authority/
);
assert.throws(
  () =>
    validateArchiveConciergeIntake({
      ...baseIntake,
      hasMemorialDeadline: true,
      memorialDeadline: ""
    }),
  /deadline/
);
assert.match(
  normalizeMemorialDeadline({ hasDeadline: true, value: "2026-09-10" }) ?? "",
  /^2026-09-10T12:00:00\.000Z$/
);

// Order-number generation
assert.match(migration, /create sequence if not exists public\.concierge_order_number_seq/);
assert.match(migration, /nextval\('public\.concierge_order_number_seq'\)/);
assert.match(migration, /AC-' \|\| to_char\(now\(\), 'YYYY'\)/);
assert.doesNotMatch(domain, /count\(\*\)|\.select\("id"\).*count/i);

// RLS and internal-field protections
for (const table of [
  "concierge_orders",
  "concierge_order_status_history",
  "concierge_order_materials",
  "concierge_order_revisions",
  "concierge_order_keepsakes"
]) {
  assert.match(
    migration,
    new RegExp(`alter table public\\.${table} enable row level security`)
  );
}
assert.match(migration, /customer_id = auth\.uid\(\)/);
assert.match(migration, /revoke all on public\.concierge_orders from anon, authenticated/);
assert.match(migration, /grant select \([\s\S]*customer_notes[\s\S]*\) on public\.concierge_orders to authenticated/);
assert.doesNotMatch(
  migration.match(/grant select \([\s\S]*?\) on public\.concierge_orders to authenticated/)?.[0] ?? "",
  /internal_notes|stripe_checkout_session_id|assigned_admin_id/
);
assert.doesNotMatch(
  migration.match(/grant select \([\s\S]*?\) on public\.concierge_order_materials to authenticated/)?.[0] ?? "",
  /storage_path|intake_condition|internal_notes/
);

assert.equal(
  assertNoInternalCustomerFields({
    id: "order",
    orderNumber: "AC-2026-000001",
    customerName: "Ada",
    customerEmail: "ada@example.com",
    customerPhone: null,
    archiveSubjectName: "Ada",
    archiveType: "living",
    packageKey: "legacy",
    status: "inquiry",
    serviceMethod: "mixed",
    memorialDeadline: null,
    eventType: null,
    customerNotes: null,
    requestedItemCount: null,
    receivedItemCount: 0,
    includedRevisionCount: 2,
    usedRevisionCount: 0,
    isRush: false,
    customerApprovedAt: null,
    completedAt: null,
    createdAt: "2026-08-06T00:00:00.000Z",
    statusHistory: [],
    materials: [],
    revisions: [],
    keepsakes: []
  }),
  true
);

// Route rendering and public messaging
assert.match(publicPage, /Archive Concierge/);
assert.match(publicPage, /You bring us the memories\. We build the Life Archive\./);
assert.match(publicPage, /Your memories do not need to arrive perfectly organized/);
assert.match(publicPage, /Start My Archive/);
assert.match(publicPage, /Request a Custom Quote/);
assert.match(publicPage, /Memorial Priority/);
assert.match(publicPage, /nothing is publicly published before customer approval/i);
assert.match(publicPage, /Archive Concierge \| Done-for-You Life & Memorial Archives/);
assert.match(nav, /href: "\/archive-concierge"/);

// Customer auth and duplicate submission protection
assert.match(intakePage, /redirect\("\/login\?next=%2Farchive-concierge%2Fstart"\)/);
assert.match(intakePage, /FormButton/);
assert.match(intakeActions, /createArchiveConciergeOrder/);
assert.doesNotMatch(intakeActions, /amountPaid|stripe|assignedAdminId|status:/);
assert.match(customerDashboard, /listCustomerConciergeOrders/);
assert.match(customerDetail, /getCustomerConciergeOrder/);
assert.doesNotMatch(customerDetail, /internalNotes|stripeCheckoutSessionId|storagePath|intakeCondition/);

// Admin authorization and status transition validation
assert.match(adminPage, /getAdminAccess/);
assert.match(adminDetail, /getAdminAccess/);
assert.match(adminActions, /updateAdminConciergeOrderStatus/);
assert.match(domain, /isArchiveConciergeStatus\(input\.status\)/);
assert.equal(isArchiveConciergeStatus("customer_review"), true);
assert.equal(isArchiveConciergeStatus("made_up_status"), false);
for (const status of ["completed", "on_hold", "canceled"]) {
  assert.ok(archiveConciergeStatuses.includes(status as any));
}
assert.match(domain, /concierge_order_status_history/);

console.log("archive-concierge tests passed cleanly!");
