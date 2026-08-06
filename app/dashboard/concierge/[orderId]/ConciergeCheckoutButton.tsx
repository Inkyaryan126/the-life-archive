"use client";

import { useState } from "react";
import { isValidStripeCheckoutUrl } from "@/lib/archive-concierge-payment-rules";

type ConciergeCheckoutButtonProps = {
  orderId: string;
  memorialPriorityEligible: boolean;
  memorialPriorityConfigured: boolean;
  memorialPriorityMessage: string | null;
};

export function ConciergeCheckoutButton({
  orderId,
  memorialPriorityEligible,
  memorialPriorityConfigured,
  memorialPriorityMessage
}: ConciergeCheckoutButtonProps) {
  const [includeMemorialPriority, setIncludeMemorialPriority] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    if (pending) {
      return;
    }

    setPending(true);
    setError(null);

    const body = new FormData();
    body.set("orderId", orderId);
    if (
      memorialPriorityEligible &&
      memorialPriorityConfigured &&
      includeMemorialPriority
    ) {
      body.set("memorialPriority", "on");
    }

    try {
      const response = await fetch("/api/stripe/archive-concierge/checkout", {
        method: "POST",
        body
      });
      const payload = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Checkout could not start. Please try again.");
      }

      const checkoutUrl = payload.url;

      if (!isValidStripeCheckoutUrl(checkoutUrl)) {
        throw new Error("Checkout could not open safely. Please try again.");
      }

      window.location.assign(checkoutUrl as string);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Checkout could not start. Please try again."
      );
      setPending(false);
    }
  }

  return (
    <div className="grid gap-4">
      {memorialPriorityEligible ? (
        <div className="rounded-xl border border-archive-gold/18 bg-black/24 p-4">
          <label className="flex items-start gap-3">
            <input
              checked={includeMemorialPriority}
              onChange={(event) => setIncludeMemorialPriority(event.target.checked)}
              type="checkbox"
              disabled={!memorialPriorityConfigured || pending}
              className="mt-1"
            />
            <span>
              <strong className="block text-archive-ivory">
                Memorial Priority Service
              </strong>
              <span>
                Requests expedited handling. The deadline is reviewed after payment and
                material intake. Purchasing it does not publish the archive automatically
                and does not override missing materials or family approval requirements.
              </span>
              {!memorialPriorityConfigured ? (
                <span className="mt-2 block text-archive-gold">
                  {memorialPriorityMessage}
                </span>
              ) : null}
            </span>
          </label>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-300/25 bg-red-400/10 p-4 text-sm text-red-100">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        disabled={pending}
        onClick={startCheckout}
        className="w-full rounded-full bg-archive-gold px-5 py-3 text-sm font-bold text-archive-obsidian disabled:cursor-not-allowed disabled:opacity-65"
      >
        {pending ? "Opening checkout..." : "Continue to Secure Checkout"}
      </button>
    </div>
  );
}
