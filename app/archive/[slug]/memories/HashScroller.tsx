"use client";

import { useEffect } from "react";

export function HashScroller() {
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash.replace(/^#/, "");

      if (!hash) {
        return;
      }

      const target = document.getElementById(hash);

      if (!target) {
        return;
      }

      target.scrollIntoView({ block: "start", behavior: "auto" });
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);

    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return null;
}
