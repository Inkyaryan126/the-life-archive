try {
  require("server-only");
} catch {
  // Ignored in ts-node/tsx test runners.
}

import type { SupabaseClient } from "@supabase/supabase-js";
import { getAccountContext } from "@/lib/account";
import { getAdminAccess } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  archiveConciergeStatuses,
  isArchiveConciergeArchiveType,
  isArchiveConciergeKeepsakeStatus,
  isArchiveConciergeMaterialType,
  isArchiveConciergePackageKey,
  isArchiveConciergePaymentStatus,
  isArchiveConciergeStatus,
  type ArchiveConciergeArchiveType,
  type ArchiveConciergeKeepsakeStatus,
  type ArchiveConciergeMaterialType,
  type ArchiveConciergePackageKey,
  type ArchiveConciergePaymentModel,
  type ArchiveConciergePaymentStatus,
  type ArchiveConciergeServiceMethod,
  type ArchiveConciergeStatus
} from "@/lib/archive-concierge-config";
import {
  ArchiveConciergeError,
  normalizeItemCount,
  requireText,
  trimToNull,
  validateArchiveConciergeIntake,
  type ArchiveConciergeIntakeInput
} from "@/lib/archive-concierge-validation";

export {
  ArchiveConciergeError,
  assertNoInternalCustomerFields,
  normalizeMemorialDeadline,
  validateArchiveConciergeIntake
} from "@/lib/archive-concierge-validation";

export type { ArchiveConciergeIntakeInput } from "@/lib/archive-concierge-validation";

type AdminClient = SupabaseClient<any, "public", any>;

export type CustomerConciergeOrderSummary = {
  id: string;
  orderNumber: string;
  archiveSubjectName: string;
  archiveType: ArchiveConciergeArchiveType;
  packageKey: ArchiveConciergePackageKey;
  status: ArchiveConciergeStatus;
  paymentStatus: ArchiveConciergePaymentStatus;
  paymentModel: ArchiveConciergePaymentModel;
  memorialDeadline: string | null;
  amountPaid: number | null;
  currency: string | null;
  depositAmountPaid: number | null;
  totalAmountPaid: number | null;
  balanceDue: number | null;
  checkoutStartedAt: string | null;
  paidAt: string | null;
  memorialPriorityPurchased: boolean;
  memorialPriorityAmount: number | null;
  paymentCurrency: string | null;
  paymentConfirmationSentAt: string | null;
  createdAt: string;
};

export type CustomerConciergeOrderDetail = CustomerConciergeOrderSummary & {
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  serviceMethod: ArchiveConciergeServiceMethod | null;
  eventType: string | null;
  customerNotes: string | null;
  requestedItemCount: number | null;
  receivedItemCount: number;
  includedRevisionCount: number;
  usedRevisionCount: number;
  isRush: boolean;
  customerApprovedAt: string | null;
  completedAt: string | null;
  statusHistory: Array<{
    id: string;
    previousStatus: ArchiveConciergeStatus | null;
    newStatus: ArchiveConciergeStatus;
    note: string | null;
    createdAt: string;
  }>;
  materials: Array<{
    id: string;
    materialType: ArchiveConciergeMaterialType;
    originalName: string | null;
    quantity: number;
    customerDescription: string | null;
    receivedAt: string | null;
    returnedAt: string | null;
    createdAt: string;
  }>;
  revisions: Array<{
    id: string;
    requestText: string;
    status: string;
    resolvedAt: string | null;
    createdAt: string;
  }>;
  keepsakes: Array<{
    id: string;
    keepsakeType: string;
    quantity: number;
    engravingText: string | null;
    productionStatus: ArchiveConciergeKeepsakeStatus;
    trackingNumber: string | null;
    createdAt: string;
  }>;
};

export type AdminConciergeOrderSummary = CustomerConciergeOrderDetail & {
  customerId: string | null;
  assignedAdminId: string | null;
  archiveId: string | null;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  stripeCustomerId: string | null;
  stripeCheckoutExpiresAt: string | null;
  lastPaymentEventId: string | null;
  internalNotes: string | null;
};

export const customerConciergeOrderColumns = `
  id,
  order_number,
  customer_name,
  customer_email,
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
`;

const adminConciergeOrderColumns = `
  ${customerConciergeOrderColumns},
  customer_id,
  assigned_admin_id,
  archive_id,
  stripe_checkout_session_id,
  stripe_payment_intent_id,
  stripe_customer_id,
  stripe_checkout_expires_at,
  last_payment_event_id,
  internal_notes
`;

function getAdminClient() {
  return createAdminClient() as AdminClient;
}

export async function generateArchiveConciergeOrderNumber(
  supabase: AdminClient = getAdminClient()
) {
  const { data, error } = await supabase.rpc(
    "generate_concierge_order_number"
  );

  if (error || !data || typeof data !== "string") {
    throw new ArchiveConciergeError(
      "database_error",
      error?.message || "Unable to generate an Archive Concierge order number."
    );
  }

  return data;
}

function mapOrder(row: any): CustomerConciergeOrderDetail {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone ?? null,
    archiveSubjectName: row.archive_subject_name,
    archiveType: row.archive_type,
    packageKey: row.package_key,
    status: row.status,
    paymentStatus: row.payment_status ?? "not_started",
    paymentModel: row.payment_model ?? "full",
    serviceMethod: row.service_method ?? null,
    memorialDeadline: row.memorial_deadline ?? null,
    eventType: row.event_type ?? null,
    customerNotes: row.customer_notes ?? null,
    requestedItemCount: row.requested_item_count ?? null,
    receivedItemCount: Number(row.received_item_count ?? 0),
    includedRevisionCount: Number(row.included_revision_count ?? 0),
    usedRevisionCount: Number(row.used_revision_count ?? 0),
    isRush: Boolean(row.is_rush),
    amountPaid: row.amount_paid ?? null,
    currency: row.currency ?? null,
    depositAmountPaid: row.deposit_amount_paid ?? null,
    totalAmountPaid: row.total_amount_paid ?? null,
    balanceDue: row.balance_due ?? null,
    checkoutStartedAt: row.checkout_started_at ?? null,
    paidAt: row.paid_at ?? null,
    memorialPriorityPurchased: Boolean(row.memorial_priority_purchased),
    memorialPriorityAmount: row.memorial_priority_amount ?? null,
    paymentCurrency: row.payment_currency ?? null,
    paymentConfirmationSentAt: row.payment_confirmation_sent_at ?? null,
    customerApprovedAt: row.customer_approved_at ?? null,
    completedAt: row.completed_at ?? null,
    createdAt: row.created_at,
    statusHistory: [],
    materials: [],
    revisions: [],
    keepsakes: []
  };
}

function mapAdminOrder(row: any): AdminConciergeOrderSummary {
  return {
    ...mapOrder(row),
    customerId: row.customer_id ?? null,
    assignedAdminId: row.assigned_admin_id ?? null,
    archiveId: row.archive_id ?? null,
    stripeCheckoutSessionId: row.stripe_checkout_session_id ?? null,
    stripePaymentIntentId: row.stripe_payment_intent_id ?? null,
    stripeCustomerId: row.stripe_customer_id ?? null,
    stripeCheckoutExpiresAt: row.stripe_checkout_expires_at ?? null,
    lastPaymentEventId: row.last_payment_event_id ?? null,
    internalNotes: row.internal_notes ?? null
  };
}

export async function createArchiveConciergeOrder(
  input: ArchiveConciergeIntakeInput
) {
  const account = await getAccountContext();

  if (!account.user) {
    throw new ArchiveConciergeError(
      "authentication_required",
      "Sign in to start an Archive Concierge order."
    );
  }

  const validated = validateArchiveConciergeIntake(input);
  const supabase = getAdminClient();
  const orderNumber = await generateArchiveConciergeOrderNumber(supabase);
  const { data, error } = await supabase
    .from("concierge_orders")
    .insert({
      order_number: orderNumber,
      customer_id: account.user.id,
      customer_email: validated.customerEmail,
      customer_name: validated.customerName,
      customer_phone: validated.customerPhone,
      archive_subject_name: validated.archiveSubjectName,
      archive_type: validated.archiveType,
      package_key: validated.packageKey,
      status: validated.status,
      payment_model: validated.packageKey === "custom" ? "deposit" : "full",
      service_method: validated.serviceMethod,
      memorial_deadline: validated.memorialDeadline,
      event_type: validated.eventType,
      customer_notes: validated.customerNotes,
      requested_item_count: validated.requestedItemCount,
      included_revision_count: validated.includedRevisionCount,
      is_rush: validated.isRush
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new ArchiveConciergeError(
      "database_error",
      error?.message || "Unable to create Archive Concierge order."
    );
  }

  await supabase.from("concierge_order_status_history").insert({
    concierge_order_id: data.id,
    previous_status: null,
    new_status: validated.status,
    changed_by: account.user.id,
    customer_visible: true,
    note: "Archive Concierge intake received."
  });

  return { id: data.id as string, orderNumber };
}

export async function listCustomerConciergeOrders() {
  const account = await getAccountContext();
  if (!account.user) {
    throw new ArchiveConciergeError("authentication_required", "Sign in required.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("concierge_orders")
    .select(customerConciergeOrderColumns)
    .eq("customer_id", account.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new ArchiveConciergeError("database_error", error.message);
  }

  return (data ?? []).map(mapOrder) as CustomerConciergeOrderSummary[];
}

export async function getCustomerConciergeOrder(orderId: string) {
  const account = await getAccountContext();
  if (!account.user) {
    throw new ArchiveConciergeError("authentication_required", "Sign in required.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("concierge_orders")
    .select(customerConciergeOrderColumns)
    .eq("id", orderId)
    .eq("customer_id", account.user.id)
    .maybeSingle();

  if (error) {
    throw new ArchiveConciergeError("database_error", error.message);
  }

  if (!data) {
    return null;
  }

  const order = mapOrder(data);
  const [
    { data: historyRows },
    { data: materialRows },
    { data: revisionRows },
    { data: keepsakeRows }
  ] = await Promise.all([
    supabase
      .from("concierge_order_status_history")
      .select("id, previous_status, new_status, note, created_at")
      .eq("concierge_order_id", orderId)
      .eq("customer_visible", true)
      .order("created_at", { ascending: true }),
    supabase
      .from("concierge_order_materials")
      .select("id, material_type, original_name, quantity, customer_description, received_at, returned_at, created_at")
      .eq("concierge_order_id", orderId)
      .order("created_at", { ascending: true }),
    supabase
      .from("concierge_order_revisions")
      .select("id, request_text, status, resolved_at, created_at")
      .eq("concierge_order_id", orderId)
      .order("created_at", { ascending: false }),
    supabase
      .from("concierge_order_keepsakes")
      .select("id, keepsake_type, quantity, engraving_text, production_status, tracking_number, created_at")
      .eq("concierge_order_id", orderId)
      .order("created_at", { ascending: true })
  ]);

  order.statusHistory = (historyRows ?? []).map((row: any) => ({
    id: row.id,
    previousStatus: row.previous_status ?? null,
    newStatus: row.new_status,
    note: row.note ?? null,
    createdAt: row.created_at
  }));
  order.materials = (materialRows ?? []).map((row: any) => ({
    id: row.id,
    materialType: row.material_type,
    originalName: row.original_name ?? null,
    quantity: Number(row.quantity ?? 1),
    customerDescription: row.customer_description ?? null,
    receivedAt: row.received_at ?? null,
    returnedAt: row.returned_at ?? null,
    createdAt: row.created_at
  }));
  order.revisions = (revisionRows ?? []).map((row: any) => ({
    id: row.id,
    requestText: row.request_text,
    status: row.status,
    resolvedAt: row.resolved_at ?? null,
    createdAt: row.created_at
  }));
  order.keepsakes = (keepsakeRows ?? []).map((row: any) => ({
    id: row.id,
    keepsakeType: row.keepsake_type,
    quantity: Number(row.quantity ?? 1),
    engravingText: row.engraving_text ?? null,
    productionStatus: row.production_status,
    trackingNumber: row.tracking_number ?? null,
    createdAt: row.created_at
  }));

  return order;
}

export async function assertCustomerOwnsConciergeOrder(orderId: string) {
  const order = await getCustomerConciergeOrder(orderId);
  if (!order) {
    throw new ArchiveConciergeError("not_found", "Order was not found.");
  }
  return order;
}

export async function listAdminConciergeOrders(filters: {
  status?: string | null;
  packageKey?: string | null;
  archiveType?: string | null;
  rush?: boolean;
  upcomingDeadlines?: boolean;
  waitingOnCustomer?: boolean;
  waitingForApproval?: boolean;
  paymentStatus?: string | null;
  memorialPriority?: boolean;
} = {}) {
  const { isAdmin } = await getAdminAccess();
  if (!isAdmin) {
    throw new ArchiveConciergeError("admin_required", "Admin access required.");
  }

  const supabase = getAdminClient();
  let query = supabase
    .from("concierge_orders")
    .select(adminConciergeOrderColumns)
    .order("created_at", { ascending: false });

  if (filters.status && isArchiveConciergeStatus(filters.status)) {
    query = query.eq("status", filters.status);
  }
  if (filters.packageKey && isArchiveConciergePackageKey(filters.packageKey)) {
    query = query.eq("package_key", filters.packageKey);
  }
  if (filters.archiveType && isArchiveConciergeArchiveType(filters.archiveType)) {
    query = query.eq("archive_type", filters.archiveType);
  }
  if (filters.rush) {
    query = query.eq("is_rush", true);
  }
  if (filters.upcomingDeadlines) {
    const inFourteenDays = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    query = query
      .not("memorial_deadline", "is", null)
      .lte("memorial_deadline", inFourteenDays.toISOString());
  }
  if (filters.waitingOnCustomer) {
    query = query.in("status", [
      "intake_required",
      "awaiting_payment",
      "awaiting_materials",
      "changes_requested"
    ]);
  }
  if (filters.waitingForApproval) {
    query = query.eq("status", "customer_review");
  }
  if (filters.paymentStatus && isArchiveConciergePaymentStatus(filters.paymentStatus)) {
    query = query.eq("payment_status", filters.paymentStatus);
  }
  if (filters.memorialPriority) {
    query = query.eq("memorial_priority_purchased", true);
  }

  const { data, error } = await query;
  if (error) {
    throw new ArchiveConciergeError("database_error", error.message);
  }

  return (data ?? []).map(mapAdminOrder);
}

export async function getAdminConciergeOrder(orderId: string) {
  const { isAdmin } = await getAdminAccess();
  if (!isAdmin) {
    throw new ArchiveConciergeError("admin_required", "Admin access required.");
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("concierge_orders")
    .select(adminConciergeOrderColumns)
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    throw new ArchiveConciergeError("database_error", error.message);
  }
  if (!data) {
    return null;
  }

  const order = mapAdminOrder(data);
  const [
    { data: historyRows },
    { data: materialRows },
    { data: revisionRows },
    { data: keepsakeRows }
  ] = await Promise.all([
    supabase
      .from("concierge_order_status_history")
      .select("*")
      .eq("concierge_order_id", orderId)
      .order("created_at", { ascending: true }),
    supabase
      .from("concierge_order_materials")
      .select("*")
      .eq("concierge_order_id", orderId)
      .order("created_at", { ascending: true }),
    supabase
      .from("concierge_order_revisions")
      .select("*")
      .eq("concierge_order_id", orderId)
      .order("created_at", { ascending: false }),
    supabase
      .from("concierge_order_keepsakes")
      .select("*")
      .eq("concierge_order_id", orderId)
      .order("created_at", { ascending: true })
  ]);

  order.statusHistory = (historyRows ?? []).map((row: any) => ({
    id: row.id,
    previousStatus: row.previous_status ?? null,
    newStatus: row.new_status,
    note: row.note ?? null,
    createdAt: row.created_at
  }));
  order.materials = (materialRows ?? []).map((row: any) => ({
    id: row.id,
    materialType: row.material_type,
    originalName: row.original_name ?? null,
    quantity: Number(row.quantity ?? 1),
    customerDescription: row.customer_description ?? null,
    receivedAt: row.received_at ?? null,
    returnedAt: row.returned_at ?? null,
    createdAt: row.created_at
  }));
  order.revisions = (revisionRows ?? []).map((row: any) => ({
    id: row.id,
    requestText: row.request_text,
    status: row.status,
    resolvedAt: row.resolved_at ?? null,
    createdAt: row.created_at
  }));
  order.keepsakes = (keepsakeRows ?? []).map((row: any) => ({
    id: row.id,
    keepsakeType: row.keepsake_type,
    quantity: Number(row.quantity ?? 1),
    engravingText: row.engraving_text ?? null,
    productionStatus: row.production_status,
    trackingNumber: row.tracking_number ?? null,
    createdAt: row.created_at
  }));

  return order;
}

export async function updateAdminConciergeOrderStatus(input: {
  orderId: string;
  status: string;
  note?: string | null;
  customerVisible?: boolean;
}) {
  const { account, isAdmin } = await getAdminAccess();
  if (!isAdmin) {
    throw new ArchiveConciergeError("admin_required", "Admin access required.");
  }
  if (!isArchiveConciergeStatus(input.status)) {
    throw new ArchiveConciergeError("invalid_status", "Choose a valid status.");
  }

  const supabase = getAdminClient();
  const { data: existing, error: existingError } = await supabase
    .from("concierge_orders")
    .select("id, status")
    .eq("id", input.orderId)
    .maybeSingle();

  if (existingError || !existing) {
    throw new ArchiveConciergeError(
      "not_found",
      existingError?.message || "Order was not found."
    );
  }

  const now = new Date().toISOString();
  const updateData: Record<string, any> = { status: input.status };
  if (input.status === "completed") updateData.completed_at = now;
  if (input.status === "canceled") updateData.canceled_at = now;

  const { error } = await supabase
    .from("concierge_orders")
    .update(updateData)
    .eq("id", input.orderId);

  if (error) {
    throw new ArchiveConciergeError("database_error", error.message);
  }

  await supabase.from("concierge_order_status_history").insert({
    concierge_order_id: input.orderId,
    previous_status: existing.status,
    new_status: input.status,
    changed_by: account.user?.id ?? null,
    customer_visible: input.customerVisible ?? true,
    note: trimToNull(input.note, 1200)
  });
}

export async function updateAdminConciergeOrderDetails(input: {
  orderId: string;
  assignedAdminId?: string | null;
  internalNotes?: string | null;
  receivedItemCount?: number | null;
  customerApproved?: boolean;
}) {
  const { account, isAdmin } = await getAdminAccess();
  if (!isAdmin) {
    throw new ArchiveConciergeError("admin_required", "Admin access required.");
  }

  const updateData: Record<string, any> = {
    assigned_admin_id: trimToNull(input.assignedAdminId, 80),
    internal_notes: trimToNull(input.internalNotes, 8000)
  };

  if (input.receivedItemCount !== null && input.receivedItemCount !== undefined) {
    updateData.received_item_count = normalizeItemCount(input.receivedItemCount) ?? 0;
  }
  if (input.customerApproved) {
    updateData.customer_approved_at = new Date().toISOString();
  }

  const supabase = getAdminClient();
  const { error } = await supabase
    .from("concierge_orders")
    .update(updateData)
    .eq("id", input.orderId);

  if (error) {
    throw new ArchiveConciergeError("database_error", error.message);
  }

  if (input.customerApproved) {
    await supabase.from("concierge_order_status_history").insert({
      concierge_order_id: input.orderId,
      previous_status: null,
      new_status: "approved",
      changed_by: account.user?.id ?? null,
      customer_visible: true,
      note: "Customer approval recorded."
    });
  }
}

export async function addAdminConciergeMaterial(input: {
  orderId: string;
  materialType: string;
  originalName?: string | null;
  quantity?: number | null;
  customerDescription?: string | null;
  internalNotes?: string | null;
  received: boolean;
}) {
  const { isAdmin } = await getAdminAccess();
  if (!isAdmin) {
    throw new ArchiveConciergeError("admin_required", "Admin access required.");
  }
  if (!isArchiveConciergeMaterialType(input.materialType)) {
    throw new ArchiveConciergeError(
      "invalid_material_type",
      "Choose a valid material type."
    );
  }

  const supabase = getAdminClient();
  const { error } = await supabase.from("concierge_order_materials").insert({
    concierge_order_id: input.orderId,
    material_type: input.materialType,
    original_name: trimToNull(input.originalName, 240),
    quantity: normalizeItemCount(input.quantity ?? 1) ?? 1,
    customer_description: trimToNull(input.customerDescription, 1200),
    internal_notes: trimToNull(input.internalNotes, 1200),
    received_at: input.received ? new Date().toISOString() : null
  });

  if (error) {
    throw new ArchiveConciergeError("database_error", error.message);
  }
}

export async function addAdminConciergeKeepsake(input: {
  orderId: string;
  keepsakeType: string;
  quantity?: number | null;
  engravingText?: string | null;
  productionStatus: string;
  internalNotes?: string | null;
}) {
  const { isAdmin } = await getAdminAccess();
  if (!isAdmin) {
    throw new ArchiveConciergeError("admin_required", "Admin access required.");
  }
  if (!isArchiveConciergeKeepsakeStatus(input.productionStatus)) {
    throw new ArchiveConciergeError(
      "invalid_keepsake_status",
      "Choose a valid keepsake production status."
    );
  }

  const keepsakeType = requireText(
    input.keepsakeType,
    "invalid_keepsake_status",
    "Keepsake type"
  );

  const supabase = getAdminClient();
  const { error } = await supabase.from("concierge_order_keepsakes").insert({
    concierge_order_id: input.orderId,
    keepsake_type: keepsakeType,
    quantity: normalizeItemCount(input.quantity ?? 1) ?? 1,
    engraving_text: trimToNull(input.engravingText, 240),
    production_status: input.productionStatus,
    internal_notes: trimToNull(input.internalNotes, 1200)
  });

  if (error) {
    throw new ArchiveConciergeError("database_error", error.message);
  }
}

export function getCustomerWaitingStatuses() {
  return archiveConciergeStatuses.filter((status) =>
    [
      "intake_required",
      "awaiting_payment",
      "awaiting_materials",
      "changes_requested"
    ].includes(status)
  );
}
