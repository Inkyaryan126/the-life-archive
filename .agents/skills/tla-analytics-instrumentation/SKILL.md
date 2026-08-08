---
name: tla-analytics-instrumentation
description: Specify and audit event tracking, user journeys, attribution models, and conversion metrics across Next.js and Supabase without inventing metrics.
---

# TLA Analytics Instrumentation

Specify, audit, and implement clean telemetry, attribution parameters, and event tracking across `People -> Connections -> Memories -> Experiences -> Keepsakes -> Time Capsules/Future Surprises`.

## Triggers
Activate this skill when:
- Instrumenting new user actions, conversion steps, or component interactions.
- Auditing existing event dispatches, telemetry helper modules, or analytics route handlers.
- Configuring first-party attribution tracking (UTM parameters, referral codes, QR scan sources).
- Reviewing analytics data pipelines, event schemas, or telemetry privacy compliance.

## Inputs to Inspect
- Central telemetry modules (`lib/analytics.ts`, `lib/telemetry/**`).
- Client-side event invocation sites in Next.js components (`components/**`, `app/**`).
- Server-side telemetry dispatch logic in Server Actions and API routes (`app/api/**`).
- Attribution capture middleware or hooks (`middleware.ts`, `hooks/useAttribution.ts`).
- Event taxonomy definitions and database audit logging schemas.

## Step-by-Step Procedure
1. **Map Domain Events to TLA 2.0 Hierarchy**:
   - **People**: `person_created`, `person_updated`, `person_archived`
   - **Connections**: `connection_invited`, `connection_accepted`, `connection_removed`
   - **Memories**: `memory_created`, `memory_media_uploaded`, `memory_viewed`, `memory_shared`
   - **Experiences**: `experience_started`, `experience_completed`
   - **Keepsakes**: `keepsake_catalog_viewed`, `keepsake_configured`, `checkout_initiated`, `keepsake_purchased`
   - **Time Capsules**: `time_capsule_scheduled`, `time_capsule_unlocked`
2. **Audit Payload Consistency**: Ensure every event payload contains standard contextual metadata (`user_id`, `timestamp`, `session_id`, `device_type`, `attribution_source`) without inventing fake metrics.
3. **Verify Attribution Mechanics**: Ensure UTM source/medium/campaign, partner referral codes, and QR scan tokens are captured on initial session load and passed through conversion events.
4. **Enforce PII & Privacy Rules**: Strip or hash all personally identifiable information (emails, full names, raw memory text, exact locations) from telemetry payloads before dispatching.
5. **Ensure Non-Blocking Execution**: Verify that telemetry calls are strictly asynchronous and failsafe—analytics errors must never crash UI rendering or block user interactions.

## Output & Report Format
Generate an **Analytics Instrumentation Specification & Audit Report**:

```markdown
# Analytics Instrumentation Spec & Audit Report

## 1. Event Taxonomy & Payload Specification
| Event Name | Trigger Context | Required Properties | PII Sanitization | Status |
|---|---|---|---|---|
| `person_created` | Onboarding / Profile Form | `person_id`, `relationship_type`, `has_avatar` | Name omitted | Active |
| `memory_created` | Add Memory Drawer | `memory_id`, `media_type`, `word_count` | Text body omitted | Missing |
| `keepsake_purchased` | Stripe Webhook / Confirmation | `order_id`, `keepsake_type`, `amount_cents` | Address omitted | Active |

## 2. Attribution Tracking Integrity
- **Captured Parameters**: `utm_source`, `utm_medium`, `utm_campaign`, `ref`, `qr_token`
- **Persistence Mechanism**: Cookie / Session Storage -> Passed to Server Actions
- **Attribution Audit**: Verified intact from landing through checkout.

## 3. Privacy & Safety Verification
- [x] All raw user memory text stripped from event properties
- [x] Email addresses hashed or excluded from client analytics payloads
- [x] Analytics dispatch wrapped in non-blocking try/catch wrappers

## 4. Remediation Action Plan
- [ ] Add missing `memory_created` client event in `components/memory/add-memory-modal.tsx`
- [ ] Update `keepsake_configured` payload to include `keepsake_sku`
```

## Verification Requirements
- Verify TypeScript types for all telemetry event payloads compile cleanly.
- Verify analytics helper functions fail silently in development/production if tracking endpoint is unreachable.
- Inspect network requests to confirm no unhashed PII is transmitted in event payloads.
- Run `npm run build` and `npm run lint`.

## Anti-Patterns
- Never invent fabricated conversion metrics, dummy events, or fake interaction counts.
- Never log unhashed PII (user emails, full names, private story text) to analytics services.
- Never use blocking synchronous network requests for telemetry inside user interaction loops.
- Never allow telemetry errors to trigger UI error boundaries or disrupt user actions.
