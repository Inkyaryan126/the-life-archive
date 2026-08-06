import {
  archiveConciergePaidAddons,
  getArchiveConciergePackage,
  type ArchiveConciergePaymentStatus
} from "./archive-concierge-config";
import { resolveStripePriceId } from "./stripe-checkout-config";

export type CheckoutAvailability = {
  configured: boolean;
  message: string | null;
};

export function getPackageCheckoutAvailability(
  packageKey: string,
  env: Record<string, string | undefined> = process.env
): CheckoutAvailability {
  const pkg = getArchiveConciergePackage(packageKey);
  if (!pkg || !pkg.active || !pkg.checkoutEnabled) {
    return { configured: false, message: "Checkout is not active for this package." };
  }

  const result = resolveStripePriceId(pkg.stripePriceEnv, pkg.displayName, env);
  if (!result.ok) {
    return {
      configured: false,
      message: "Online checkout is not configured yet for this package."
    };
  }

  return { configured: true, message: null };
}

export function getMemorialPriorityAvailability(
  env: Record<string, string | undefined> = process.env
): CheckoutAvailability {
  const addon = archiveConciergePaidAddons.memorial_priority;
  const result = resolveStripePriceId(addon.stripePriceEnv, addon.displayName, env);
  if (!addon.active || !addon.checkoutEnabled || !result.ok) {
    return {
      configured: false,
      message: "Memorial Priority checkout is not configured yet."
    };
  }

  return { configured: true, message: null };
}

export function isMemorialPriorityEligible(order: {
  archiveType: string;
  memorialDeadline: string | null;
  eventType: string | null;
}) {
  return (
    order.archiveType === "memorial" &&
    (Boolean(order.memorialDeadline) || Boolean(order.eventType?.trim()))
  );
}

export function isOrderPayable(order: {
  status: string;
  paymentStatus: ArchiveConciergePaymentStatus | string;
}) {
  if (order.status === "canceled" || order.status === "completed") {
    return false;
  }

  return order.paymentStatus !== "paid" && order.paymentStatus !== "deposit_paid";
}
