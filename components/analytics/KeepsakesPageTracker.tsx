"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export function KeepsakesPageTracker({
  connectionId,
  name
}: {
  connectionId?: string | null;
  name?: string | null;
}) {
  useEffect(() => {
    trackEvent("keepsake_catalog_viewed", {
      path: "/keepsakes",
      has_connection: Boolean(connectionId)
    });
  }, [connectionId, name]);

  return null;
}
