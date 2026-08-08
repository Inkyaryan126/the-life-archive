---
name: tla-security-audit
description: Perform practical security, authorization, RLS, secret management, and Stripe integration audits across Next.js and Supabase.
---

# TLA Security Audit

Perform practical, targeted security audits across Next.js application routes, Supabase database structures and Row Level Security (RLS) policies, Stripe payment flows, and secret configuration.

## Triggers
Activate this skill when:
- Reviewing or modifying database schemas, migrations, or Supabase RLS policies (`supabase/migrations/**`).
- Auditing Next.js Server Actions, API routes (`app/api/**`), or authentication middleware (`middleware.ts`).
- Reviewing Stripe webhook verification, checkout session handlers, or payment fulfillment security.
- Inspecting media upload permissions, storage bucket policies, or pre-signed URL generation.
- Conducting pre-release security reviews or vulnerability scans.

## Inputs to Inspect
- Supabase SQL migrations and RLS policy definitions (`supabase/migrations/*.sql`).
- Next.js middleware and route handlers (`middleware.ts`, `app/api/**/route.ts`).
- Server Action files (`app/actions/**`, `lib/actions/**`).
- Stripe integration files (`app/api/webhooks/stripe/route.ts`, `lib/stripe.ts`).
- Storage bucket configurations and file upload policies (`lib/storage.ts`).
- Environment variable usage across client vs server boundaries (`.env.example`, `next.config.js`).

## Step-by-Step Procedure
1. **Audit Supabase RLS Policies**: Check every table (`people`, `connections`, `memories`, `keepsakes`, `time_capsules`, `orders`). Ensure policies strictly enforce `auth.uid() = user_id` or explicit connection permissions. Guarantee no table has public read/write access unless explicitly intended.
2. **Audit Server Actions & API Authorization**: Ensure all Server Actions and API endpoints validate session authentication (`supabase.auth.getUser()`) before performing mutations or reads. Confirm `SUPABASE_SERVICE_ROLE_KEY` is ONLY used in secure server contexts and never leaked to the client.
3. **Audit Stripe Webhook & Payment Security**: Verify Stripe webhook handlers validate raw request signatures using `stripe.webhooks.constructEvent()`. Verify payment amounts and line items are calculated server-side rather than trusted from client payloads.
4. **Audit Storage & Asset Protection**: Verify memory media files stored in Supabase Storage require signed URLs or authenticated RLS checks. Prevent unauthorized enumeration of user media assets.
5. **Secret & Environment Variable Audit**: Scan codebase for hardcoded API keys, bearer tokens, or exposed secret variables. Ensure all client-exposed variables use the `NEXT_PUBLIC_` prefix strictly for non-sensitive values.

## Output & Report Format
Generate a **TLA Security Audit Report**:

```markdown
# TLA Security Audit Report

## 1. Audit Scope & Vulnerability Summary
- **Audited Target**: [e.g., Supabase RLS Policies, Stripe Webhooks, API Routes]
- **Risk Level**: [SECURE / ACTION REQUIRED / CRITICAL VULNERABILITY]

## 2. Security Findings & Remediation
| Vulnerability Target | Severity | Issue Description & File Location | Exploit Scenario | Remediation Code / Policy Fix |
|---|---|---|---|---|
| `memories` table RLS | HIGH | Missing select policy constraint (`supabase/migrations/2026...sql`) | User B can query User A memories | Add `WHERE auth.uid() = owner_id` RLS policy |
| Stripe Webhook | CRITICAL | Missing signature verification check (`app/api/webhooks/stripe/route.ts`) | Attacker spoofs fake payment success event | Wrap handler with `stripe.webhooks.constructEvent()` |

## 3. Secret & Environment Variable Scan
- [x] No `SUPABASE_SERVICE_ROLE_KEY` found in client bundles
- [x] No hardcoded Stripe secret keys in repository
- [x] `.env` excluded from version control

## 4. Verification Checklist
- [ ] RLS policies tested with authenticated vs unauthenticated queries
- [ ] Stripe webhook signature rejection verified with invalid payload
- [ ] `npm run build` and `npm run lint` compile cleanly
```

## Verification Requirements
- Test Supabase RLS policies using both authenticated user context and anonymous/unauthenticated context.
- Verify Stripe webhook signature check fails cleanly when called with invalid signatures.
- Run `git grep` secret scans for sensitive strings (`sk_live`, `service_role`, private keys).
- Run `npm run build` and `npm run lint`.

## Anti-Patterns
- Never disable or weaken RLS policies to bypass access control errors.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or `STRIPE_SECRET_KEY` in client-side code or public variables.
- Never trust client-provided price, user ID, or permission parameters without server-side validation.
- Never bypass Stripe webhook signature verification in production API routes.
