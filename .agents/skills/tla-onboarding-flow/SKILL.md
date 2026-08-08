---
name: tla-onboarding-flow
description: Audit and optimize first-time user onboarding for creating People, establishing Connections, and capturing initial Memories.
---

# TLA Onboarding Flow

Audit, refine, and design the first-time user experience (FTUE) centered on the core relationship model: `People -> Connections -> Memories -> Experiences -> Keepsakes -> Time Capsules/Future Surprises`.

## Triggers
Activate this skill when:
- Designing, refactoring, or auditing first-time user onboarding (`app/onboarding/**`, initial setup flows).
- Addressing low activation rates between sign-up and first person creation or first memory capture.
- Simplifying initial data collection forms, profile creation wizards, or connection setup flows.
- Auditing welcome communications, onboarding copy, or guided product tours.

## Inputs to Inspect
- Onboarding route handlers and layout files (`app/onboarding/page.tsx`, `app/onboarding/layout.tsx`).
- Onboarding step components, state persistence mechanisms (localStorage, URL query state, Supabase auth metadata).
- User profile and Person initialization logic (`lib/person.ts`, Supabase server actions).
- Copy and micro-copy across onboarding screens (`components/onboarding/**`).
- Welcome email triggers and transaction hooks.

## Step-by-Step Procedure
1. **Trace Entry & Intent**: Map user entry points (direct sign-up, QR code scan, shared connection invite, gift keepsake recipient). Ensure onboarding tailors context to entry intent.
2. **Audit Friction & Cognitive Load**: Count required form fields, file upload demands, and permissions requested during initial setup. Remove non-essential friction prior to first value delivery.
3. **Anchor in People & Connections**: Ensure onboarding immediately guides the user to center their space around a meaningful Person (self, family member, ancestor, loved one) and establish a Connection.
4. **Prompt First Memory Capture**: Guide the user to capture a foundational Memory (photo, story, audio clip, milestone) within the first 2 minutes of onboarding.
5. **Prevent Empty State Abandonment**: Ensure completion of onboarding lands the user directly into a warm, populated space with clear suggestions for adding Experiences or exploring Keepsakes.
6. **Verify Onboarding Analytics**: Ensure events (`onboarding_started`, `person_created_onboarding`, `first_memory_added`, `onboarding_completed`) fire accurately with correct attribution.

## Output & Report Format
Generate an **Onboarding Audit & Optimization Plan**:

```markdown
# Onboarding Audit & Optimization Plan

## 1. Onboarding Flow Architecture
- **Entry Touchpoint**: [e.g., Direct Sign-up / QR Invite]
- **Current Steps**: [Step 1: Auth -> Step 2: Person Setup -> Step 3: First Memory -> Dashboard]
- **Activation Time Target**: [< 120 seconds to first memory]

## 2. Friction & Emotional Assessment
- **Field & Effort Audit**: [List unnecessary fields removed or deferred]
- **Emotional Resonance**: [Evaluate warmth, clarity, and personal connection of copy]
- **Dead Ends & Drop-off Hazards**: [Identify places where users stall or abandon]

## 3. Actionable Enhancements
| Onboarding Step | Current State | Proposed Optimization | Impact on Activation |
|---|---|---|---|
| Person Creation | Standard 8-field form | 2-field rapid setup + avatar upload | Reduces drop-off by eliminating friction |
| First Memory | Blank text area | Guided story prompt card ("Share a favorite vacation memory") | Increases memory capture completion |

## 4. Verification Checklist
- [ ] Mobile responsive wizard layout verified
- [ ] Session state retained on page refresh
- [ ] Telemetry events verified
```

## Verification Requirements
- Test onboarding flow across mobile, tablet, and desktop viewports.
- Verify onboarding state persists across accidental browser refreshes without data loss.
- Run `npm run build` and `npm run lint` to validate route compilation.
- Ensure guest or invited user credentials transition seamlessly to authenticated Person records.

## Anti-Patterns
- Never force long, multi-page questionnaires before demonstrating core platform value.
- Never use generic SaaS onboarding language ("Configure Workspace", "Add Entity").
- Never drop a new user onto an unguided empty dashboard after sign-up.
- Never bypass authentication or security controls during guest onboarding flows.
