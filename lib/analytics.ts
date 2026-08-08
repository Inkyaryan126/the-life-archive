/**
 * TLA 2.0 Telemetry & Front-Door Analytics Instrumentation
 * Clean, non-blocking, fail-safe event tracking across People, Connections, Keepsakes, and Future Surprises.
 */

export type TLAEventName =
  | "homepage_viewed"
  | "primary_cta_clicked"
  | "secondary_cta_clicked"
  | "gift_flow_started"
  | "person_selected_onboarding"
  | "first_memory_captured"
  | "keepsake_catalog_viewed"
  | "keepsake_configured"
  | "time_capsule_scheduled"
  | "people_hub_viewed";

export type EventProperties = Record<string, string | number | boolean | null | undefined>;

const PII_KEYS = ["email", "userEmail", "recipientEmail", "name", "personName", "rawText", "content", "bio"];

function sanitizeProperties(props?: EventProperties): EventProperties {
  if (!props) return {};
  const cleaned: EventProperties = {};

  for (const [key, value] of Object.entries(props)) {
    if (PII_KEYS.includes(key)) {
      continue;
    }
    if (typeof value === "string") {
      cleaned[key] = value.slice(0, 200);
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

export function trackEvent(eventName: TLAEventName, properties?: EventProperties): void {
  try {
    const payload = {
      event: eventName,
      properties: sanitizeProperties(properties),
      timestamp: new Date().toISOString()
    };

    if (typeof window !== "undefined") {
      if (process.env.NODE_ENV === "development") {
        console.log(`[TLA Analytics] ${eventName}`, payload.properties);
      }

      // Send non-blocking beacon or fetch if endpoint is available
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
        navigator.sendBeacon("/api/telemetry", blob);
      }
    }
  } catch {
    // Analytics errors must NEVER crash UI or block user interaction
  }
}
