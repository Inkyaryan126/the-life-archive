"use client";

import { useId, useState } from "react";

type PasswordFieldsProps = {
  passwordName?: string;
  confirmName?: string;
  includeConfirmation?: boolean;
  passwordLabel?: string;
  confirmLabel?: string;
  passwordHelp?: string;
  passwordPlaceholder?: string;
  confirmPlaceholder?: string;
  required?: boolean;
  autoComplete?: string;
  confirmAutoComplete?: string;
  showRequirements?: boolean;
};

const passwordRules = [
  "At least 10 characters",
  "One uppercase letter",
  "One lowercase letter",
  "One number"
];

export function PasswordFields({
  passwordName = "password",
  confirmName = "confirmPassword",
  includeConfirmation = true,
  passwordLabel = "Password",
  confirmLabel = "Confirm password",
  passwordHelp = "Use a strong password you can reuse to sign in later.",
  passwordPlaceholder = "Create a password",
  confirmPlaceholder = "Confirm your password",
  required = true,
  autoComplete = "new-password",
  confirmAutoComplete = "new-password",
  showRequirements = true
}: PasswordFieldsProps) {
  const passwordId = useId();
  const confirmId = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <label className="grid gap-2" htmlFor={passwordId}>
          <span className="text-sm font-semibold text-archive-ivory">
            {passwordLabel}
          </span>
        </label>
        <div className="relative">
          <input
            id={passwordId}
            name={passwordName}
            type={visible ? "text" : "password"}
            required={required}
            autoComplete={autoComplete}
            minLength={10}
            maxLength={128}
            placeholder={passwordPlaceholder}
            className="w-full rounded-2xl border border-archive-gold/20 bg-archive-obsidian px-4 py-3 pr-28 text-base text-archive-ivory outline-none transition placeholder:text-archive-ivory/60 focus:border-archive-gold"
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            className="absolute right-2 top-2 rounded-full border border-archive-gold/18 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
          >
            {visible ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {includeConfirmation ? (
        <div className="grid gap-2">
          <label className="grid gap-2" htmlFor={confirmId}>
            <span className="text-sm font-semibold text-archive-ivory">
              {confirmLabel}
            </span>
          </label>
          <input
            id={confirmId}
            name={confirmName}
            type={visible ? "text" : "password"}
            required={required}
            autoComplete={confirmAutoComplete}
            minLength={10}
            maxLength={128}
            placeholder={confirmPlaceholder}
            className="w-full rounded-2xl border border-archive-gold/20 bg-archive-obsidian px-4 py-3 text-base text-archive-ivory outline-none transition placeholder:text-archive-ivory/60 focus:border-archive-gold"
          />
        </div>
      ) : null}

      {showRequirements ? (
        <div className="rounded-2xl border border-archive-gold/12 bg-white/[0.03] px-4 py-3">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-archive-gold">
            Password requirements
          </p>
          <ul className="mt-2 grid gap-1.5 text-sm leading-6 text-archive-ivory/68">
            {passwordRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
            <li>128 characters or fewer</li>
          </ul>
          <p className="mt-2 text-sm leading-6 text-archive-ivory/58">
            {passwordHelp}
          </p>
        </div>
      ) : null}
    </div>
  );
}
