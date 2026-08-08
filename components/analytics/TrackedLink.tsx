"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { trackEvent, type TLAEventName, type EventProperties } from "@/lib/analytics";

type TrackedLinkProps = Omit<ComponentProps<typeof Link>, "onClick"> & {
  eventName: TLAEventName;
  eventProperties?: EventProperties;
  children: ReactNode;
  onClick?: () => void;
};

export function TrackedLink({
  eventName,
  eventProperties,
  children,
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={() => {
        try {
          trackEvent(eventName, eventProperties);
        } catch {
          // Fail-safe
        }
        if (onClick) {
          onClick();
        }
      }}
    >
      {children}
    </Link>
  );
}
