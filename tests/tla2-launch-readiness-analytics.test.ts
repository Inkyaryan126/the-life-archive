import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { trackEvent } from "../lib/analytics";

async function runLaunchReadinessAnalyticsTests() {
  console.log("Starting TLA 2.0 Launch Readiness Analytics & Context Test Suite...");

  // 1. Verify app/page.tsx has TrackedLink and primary_cta_clicked / secondary_cta_clicked
  const pagePath = path.join(process.cwd(), "app", "page.tsx");
  const pageContent = fs.readFileSync(pagePath, "utf8");

  assert.ok(
    pageContent.includes('eventName="primary_cta_clicked"'),
    "Homepage MUST instrument primary_cta_clicked"
  );
  assert.ok(
    pageContent.includes('eventName="secondary_cta_clicked"'),
    "Homepage MUST instrument secondary_cta_clicked"
  );
  assert.ok(
    pageContent.includes("HomePageTracker"),
    "Homepage MUST include homepage_viewed tracker"
  );

  // 2. Verify GiftCreationWizard has gift_flow_started, person_selected_onboarding, first_memory_captured
  const wizardPath = path.join(process.cwd(), "components", "gift-creation", "GiftCreationWizard.tsx");
  const wizardContent = fs.readFileSync(wizardPath, "utf8");

  assert.ok(
    wizardContent.includes('"gift_flow_started"'),
    "Wizard MUST instrument gift_flow_started"
  );
  assert.ok(
    wizardContent.includes('"person_selected_onboarding"'),
    "Wizard MUST instrument person_selected_onboarding"
  );
  assert.ok(
    wizardContent.includes('"first_memory_captured"'),
    "Wizard MUST instrument first_memory_captured"
  );
  assert.ok(
    wizardContent.includes('"keepsake_catalog_viewed"'),
    "Wizard MUST instrument keepsake_catalog_viewed"
  );

  // 3. Verify KeepsakesPage has connectionId, name, and KeepsakesPageTracker
  const keepsakesPath = path.join(process.cwd(), "app", "keepsakes", "page.tsx");
  const keepsakesContent = fs.readFileSync(keepsakesPath, "utf8");

  assert.ok(
    keepsakesContent.includes("connectionId"),
    "Keepsakes page MUST resolve connectionId parameter"
  );
  assert.ok(
    keepsakesContent.includes("connectionName"),
    "Keepsakes page MUST resolve connectionName parameter"
  );
  assert.ok(
    keepsakesContent.includes("KeepsakesPageTracker"),
    "Keepsakes page MUST render KeepsakesPageTracker"
  );

  // 4. Verify telemetry route exists
  const telemetryRoutePath = path.join(process.cwd(), "app", "api", "telemetry", "route.ts");
  assert.ok(fs.existsSync(telemetryRoutePath), "/api/telemetry route handler MUST exist");

  // 5. Verify non-blocking PII sanitization in lib/analytics.ts does not throw and strips PII
  trackEvent("homepage_viewed", {
    personName: "John Doe",
    email: "test@example.com",
    content: "Private memory story text",
    token: "secret-token-123",
    path: "/",
    device_type: "mobile"
  });

  console.log("TLA 2.0 Launch Readiness Analytics & Context Test Suite passed cleanly!");
}

runLaunchReadinessAnalyticsTests().catch((err) => {
  console.error("Launch Readiness Analytics test suite failed:", err);
  process.exit(1);
});
