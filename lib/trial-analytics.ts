export type TrialEventName =
  | "trial_started"
  | "trial_completed"
  | "result_shared"
  | "result_downloaded"
  | "continuity_cta_clicked";

export function trackTrialEvent(event: TrialEventName, meta?: Record<string, string | number>) {
  if (typeof window === "undefined") return;

  try {
    // Log internally for debugging/analytics without sending raw answers or user PII
    const safeMeta = meta ? { ...meta } : {};
    delete (safeMeta as any).responses;
    delete (safeMeta as any).answers;
    delete (safeMeta as any).email;

    if (process.env.NODE_ENV === "development") {
      console.log(`[Trial Analytics Event]: ${event}`, safeMeta);
    }

    // Call site-visit tracking if available
    if (navigator.sendBeacon) {
      const payload = JSON.stringify({ event, meta: safeMeta, timestamp: new Date().toISOString() });
      navigator.sendBeacon("/api/continuity", payload);
    }
  } catch (err) {
    // Silent fallback
  }
}
