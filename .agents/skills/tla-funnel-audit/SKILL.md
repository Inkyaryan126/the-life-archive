---
name: tla-funnel-audit
description: Audit visitor-to-keepsake conversion pathways, identifying friction, dead ends, competing CTAs, emotional drop-off, and missing instrumentation.
---

# TLA Funnel Audit

Audit and optimize conversion pathways across the TLA 2.0 relationship keepsake platform: `People -> Connections -> Memories -> Experiences -> Keepsakes -> Time Capsules/Future Surprises`.

## Triggers
Activate this skill when:
- Auditing user conversion drop-off points between landing, person creation, memory capture, and keepsake purchase.
- Reviewing call-to-action (CTA) hierarchy, page transitions, or checkout pathways.
- Identifying dead ends, orphan user flows, or competing actions on marketing or application pages.
- Evaluating emotional tone shifts that cause user abandonment during sensitive onboarding or purchase steps.
- Inspecting missing conversion tracking or incomplete funnel step instrumentation.

## Inputs to Inspect
- Next.js page components (`app/page.tsx`, `app/onboarding/**`, `app/person/[id]/**`, `app/keepsakes/**`, `app/checkout/**`).
- Navigation and CTA components (`components/ui/button.tsx`, `components/navigation/**`, callout banners).
- Form flows and modal interactions (person creation modals, memory add drawers, keepsake preview builders).
- Analytics event tracking triggers in client/server components (`lib/analytics.ts`, event dispatch calls).
- User feedback, drop-off analytics data, or session recordings when available.

## Step-by-Step Procedure
1. **Map the Canonical Journey**: Trace the full user flow from initial acquisition landing page through `Person -> Connection -> Memory -> Experience -> Keepsake -> Time Capsule`.
2. **Identify Conversion Friction & Dead Ends**: Audit every step for missing "Next Step" links, broken back navigation, unhandled form errors, or pages without clear progression.
3. **Audit CTA Hierarchy & Competition**: Check for multiple primary buttons competing for attention, ambiguous action labels (e.g., "Submit" vs "Save Memory"), or visual noise that distracts from the primary keepsake conversion goal.
4. **Evaluate Emotional Drop-Off**: Analyze copy, layout, and interaction tone at sensitive moments (e.g., memorial creation, sharing intimate memories, checkout). Identify abrupt, transactional, or insensitive phrasing that breaks trust.
5. **Inspect Conversion Instrumentation Gaps**: Verify that every key step (landing view, person created, memory attached, keepsake configured, checkout initiated, payment completed) dispatches accurate telemetry events.

## Output & Report Format
Generate a structured **TLA Funnel Audit Report**:

```markdown
# TLA Funnel Audit Report

## 1. Funnel Journey Map & Conversion Overview
- **Analyzed Pathway**: [e.g., Landing -> Person Setup -> First Memory -> Keepsake Checkout]
- **Overall Flow Health**: [Strong / Needs Optimization / Critical Friction]

## 2. Identified Funnel Bottlenecks
| Stage | Issue Category | Description & File Location | Emotional / Conversion Impact | Recommended Remediation |
|---|---|---|---|---|
| Person Creation | Dead End | No next prompt after person save (`app/person/create/page.tsx`) | High drop-off after creation | Add explicit "Capture First Memory" transition |
| Keepsake Builder | Competing CTA | Secondary export button matches primary checkout styling | Dilutes checkout intent | De-emphasize secondary action to outline variant |

## 3. Emotional Tone & Trust Assessment
- **Friction Points**: [List cold, mechanical, or jarring UI elements]
- **Trust Elements**: [Missing reassurance, security guarantees, or emotional resonance]

## 4. Missing Conversion Instrumentation
- [ ] `keepsake_builder_viewed`: Missing on `/keepsakes/[id]`
- [ ] `checkout_step_completed`: Missing step property on checkout form
```

## Verification Requirements
- Verify all primary user journeys have zero dead-end pages or broken navigation loops.
- Verify CTA hierarchy ensures a single primary action per viewport on key conversion screens.
- Run `npm run build` and `npm run lint` to ensure no broken routes or components were introduced.
- Test analytics event dispatches across mapped conversion steps.

## Anti-Patterns
- Never introduce aggressive, manipulative, or dark-pattern popups (e.g., countdown timers, fake scarcity).
- Never sacrifice emotional dignity or user trust for short-term clickbait tactics.
- Never leave a user on a blank or unguided screen after completing a key action.
- Never add untracked conversion steps that blind product analytics.
