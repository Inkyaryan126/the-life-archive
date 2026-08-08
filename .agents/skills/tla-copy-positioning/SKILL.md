---
name: tla-copy-positioning
description: Craft, refine, and audit user-facing copy, onboarding narratives, value propositions, and emotional positioning for TLA 2.0.
---

# TLA Copy Positioning

Craft, audit, and refine user-facing copy, onboarding narratives, value propositions, and emotional positioning to reflect TLA 2.0's people-centered message (`People -> Connections -> Memories -> Experiences -> Keepsakes -> Time Capsules/Future Surprises`).

## Triggers
Activate this skill when:
- Writing or updating landing page copy, hero headers, marketing copy, onboarding micro-copy, email templates, or error/empty state messages.
- Aligning TLA messaging with the people-centered narrative ("Preserve the people you love", "Connections, Memories, Keepsakes, and Future Surprises").
- Transitioning messaging away from legacy transactional "digital archive storage" wording.
- Polishing UI copy for emotional resonance, clarity, and tone consistency.

## Operating Rules
1. Focus copy around People, Relationships, and Emotional Legacy—emphasizing connections, shared memories, tangible keepsakes, and future time capsules.
2. Use a warm, respectful, enduring, and human tone—avoid robotic corporate jargon, cold cloud-storage metaphors, or technical jargon.
3. Ensure micro-copy (tooltips, button CTAs, form labels, empty states, error messages) guides the user with clarity, empathy, and intent.
4. Align value propositions across onboarding, marketing pages, keepsake ordering, and time capsule reveals.
5. Maintain consistency in core terminology: use "People", "Connections", "Memories", "Experiences", "Keepsakes", and "Time Capsules / Future Surprises".
6. Keep copy accessible and clear across desktop and mobile viewports without truncation.

## Verification Requirements
- Review copy in context on mobile and desktop viewports to ensure visual fit and readability.
- Run `npm run lint` to prevent broken JSX string literals or unescaped entities.
- Verify tone consistency, spelling, grammar, and brand alignment across user touchpoints.
- Ensure all interactive copy elements have clear, descriptive accessibility labels.

## Anti-Patterns
- Never frame TLA as a generic "file vault", "cloud backup", or "archive folder".
- Never use cold, mechanical, or alarming error copy for delicate emotional moments (e.g., memory creation or time capsule setup).
- Never obscure pricing, shipping details, or keepsake specifications with vague marketing claims.
- Never break accessibility by placing critical copy exclusively inside images without ALT text.
