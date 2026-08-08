---
name: tla-launch-readiness
description: Coordinate pre-launch validation across product architecture, experience design, security, performance, keepsake commerce, and regression readiness.
---

# TLA Launch Readiness

Coordinate, execute, and verify complete pre-launch readiness across all TLA 2.0 operating skills without duplicating underlying skill execution logic.

## Triggers
Activate this skill when:
- Conducting final pre-launch verification for a major release, feature milestone, or platform deployment.
- Evaluating production launch gates across architecture, UX, security, performance, commerce, and analytics.
- Performing end-to-end release sign-off before publishing production updates.

## Inputs to Inspect
- TLA skill suite specs (`.agents/skills/**`).
- System build logs and test outputs (`npm run build`, `npm run lint`, `npm test`).
- Environment variable configuration checklist (`.env.production`, Supabase project settings).
- Stripe live configuration and webhook endpoint status.
- Git repository state (`git status --short`, `git diff --check`).

## Step-by-Step Procedure
1. **Coordinate Architecture & Migration Check**: Invoke/verify criteria from `tla-product-architecture` and `tla-people-migration`. Ensure full alignment with `People -> Connections -> Memories -> Experiences -> Keepsakes -> Time Capsules/Future Surprises`.
2. **Coordinate UX & Copy Readiness Check**: Invoke/verify criteria from `tla-experience-design`, `tla-copy-positioning`, and `tla-ui-review`. Ensure extraordinary visual polish, mobile responsiveness, and emotional dignity.
3. **Coordinate Commerce & Fulfillment Check**: Invoke/verify criteria from `tla-keepsake-commerce`. Ensure Stripe webhooks, checkout flows, QR destinations, and print order payloads operate flawlessly.
4. **Coordinate Security & DB Check**: Invoke/verify criteria from `tla-security-audit` and `tla-database-change`. Ensure Supabase RLS policies are locked down, secrets are protected, and no data leaks exist.
5. **Coordinate Performance & Quality Check**: Invoke/verify criteria from `tla-performance-audit` and `tla-regression-check`. Validate Core Web Vitals, dynamic image loading, and zero regressions across core user paths.
6. **Coordinate Funnel & Telemetry Check**: Invoke/verify criteria from `tla-funnel-audit` and `tla-analytics-instrumentation`. Confirm attribution and conversion tracking fire cleanly without PII exposure.
7. **Synthesize Final Launch Gate Decision**: Compile multi-skill check results into a unified Launch Gate Decision (PASS / BLOCKED).

## Output & Report Format
Generate a **TLA Launch Readiness Audit & Gate Decision Report**:

```markdown
# TLA Launch Readiness Audit & Gate Decision Report

## 1. Executive Gate Decision
- **Final Status**: [APPROVED FOR LAUNCH / BLOCKED BY CRITICAL ISSUES]
- **Target Release**: [Version / Milestone Name]
- **Sign-off Date**: [YYYY-MM-DD]

## 2. Multi-Skill Launch Audit Matrix
| Domain / Skill | Lead Skill Evaluated | Status | Critical Findings / Risk | Gate Clearance |
|---|---|---|---|---|
| Architecture | `tla-product-architecture` | PASSED | Pure 2.0 People-centered model | CLEAR |
| UX & Copy | `tla-experience-design` | PASSED | Extraordinary polish, dignified copy | CLEAR |
| Commerce | `tla-keepsake-commerce` | PASSED | Stripe integration & QR routing verified | CLEAR |
| Security | `tla-security-audit` | PASSED | RLS verified, secrets scanned | CLEAR |
| Performance | `tla-performance-audit` | PASSED | LCP < 1.8s, images optimized | CLEAR |
| Analytics | `tla-analytics-instrumentation` | PASSED | Telemetry schema verified, PII clean | CLEAR |
| Regression | `tla-regression-check` | PASSED | Targeted test suite green | CLEAR |

## 3. Pre-Launch Verification Checklist
- [x] `npm run build` succeeded with zero errors
- [x] `npm run lint` passed clean
- [x] `npm test` suite passed
- [x] `git diff --check` verified clean (no whitespace/conflict markers)
- [x] Production environment variables verified

## 4. Launch Blockers (If Any)
*None. Platform is verified ready for production release.*
```

## Verification Requirements
- Run full build pipeline: `npm run build`, `npm run lint`, `npm test`, `git diff --check`.
- Confirm all 7 domain readiness checks are completed cleanly.
- Verify git working directory status contains only intended changes.

## Anti-Patterns
- Never duplicate the deep technical execution logic of child skills (delegate/coordinate instead).
- Never approve launch readiness when critical security, RLS, or payment bugs remain open.
- Never launch with unverified live Stripe keys or exposed Supabase service role keys.
- Never force-push or bypass mandatory release verification steps.
