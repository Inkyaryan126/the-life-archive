"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export function HomePageTracker() {
  useEffect(() => {
    trackEvent("homepage_viewed", {
      path: "/",
      title: "The Life Archive — Be there, even when you can't be."
    });
  }, []);

  return null;
}
