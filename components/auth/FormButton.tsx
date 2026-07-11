"use client";

import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes } from "react";

type FormButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingText?: string;
};

export function FormButton({
  children,
  className,
  pendingText = "Saving...",
  disabled,
  ...props
}: FormButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={className}
    >
      {pending ? pendingText : children}
    </button>
  );
}
