"use client";

import { useId, useState } from "react";
import { FormButton } from "@/components/auth/FormButton";

function ConfirmButton({
  children,
  className,
  pendingText
}: {
  children: string;
  className: string;
  pendingText: string;
}) {
  return (
    <FormButton pendingText={pendingText} className={className}>
      {children}
    </FormButton>
  );
}

type TimeCapsuleConfirmActionProps = {
  action: (formData: FormData) => void | Promise<void>;
  body: string;
  confirmLabel: string;
  confirmPendingLabel: string;
  deliveryId: string;
  destructive?: boolean;
  heading: string;
  triggerLabel: string;
  triggerClassName?: string;
};

export function TimeCapsuleConfirmAction({
  action,
  body,
  confirmLabel,
  confirmPendingLabel,
  deliveryId,
  destructive = false,
  heading,
  triggerLabel,
  triggerClassName
}: TimeCapsuleConfirmActionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const headingId = useId();

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          triggerClassName ??
          (destructive
            ? "rounded-full border border-red-900/45 px-4 py-2 text-sm font-semibold text-red-100 transition hover:border-red-600 hover:bg-red-950/30"
            : "rounded-full border border-archive-gold/25 px-4 py-2 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/10")
        }
      >
        {triggerLabel}
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-archive-obsidian/80 px-5 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
        >
          <div className="w-full max-w-md rounded-[2rem] border border-archive-gold/20 bg-archive-obsidian p-6 shadow-luxury">
            <h2
              id={headingId}
              className="font-serif text-3xl text-archive-ivory"
            >
              {heading}
            </h2>
            <p className="mt-4 leading-7 text-archive-ivory/72">{body}</p>

            <form action={action} className="mt-6 flex flex-wrap gap-3">
              <input type="hidden" name="deliveryId" value={deliveryId} />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-archive-gold/25 px-5 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/10"
              >
                Cancel
              </button>
              <ConfirmButton
                pendingText={confirmPendingLabel}
                className={
                  destructive
                    ? "rounded-full bg-red-950/80 px-5 py-3 text-sm font-semibold text-red-50 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-60"
                    : "rounded-full bg-archive-gold px-5 py-3 text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne disabled:cursor-not-allowed disabled:opacity-60"
                }
              >
                {confirmLabel}
              </ConfirmButton>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
