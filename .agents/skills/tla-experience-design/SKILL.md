---
name: tla-experience-design
description: Design and build high-touch, emotionally resonant, and visually stunning interactive experiences in TLA 2.0.
---

# TLA Experience Design

Design and build visually extraordinary, deeply emotional, and fluid user experiences for TLA 2.0 that wow users and honor human connections.

## Triggers
Activate this skill when:
- Building or updating UI components, storybook flows, memory timelines, experience viewports, interactive keepsake showcases, or surprise reveal screens.
- Refining mobile/desktop layouts, dark mode aesthetics, glassmorphism, or micro-animations for TLA 2.0.
- Implementing user interactions across People, Connections, Memories, Keepsakes, and Time Capsules.
- Resolving visual UX flaws, touch interactions, or responsive design issues.

## Operating Rules
1. Anchor every UI experience around People and Connections—highlighting human relationships, stories, and shared emotions.
2. Implement rich, modern design aesthetics: curated harmonious color palettes (black/gold/warm tones), typography hierarchy (Inter, Outfit), subtle gradients, glassmorphism, and responsive micro-animations.
3. Ensure seamless cross-device compatibility: design for touch targets on mobile and expansive viewports on desktop without hardcoded overlapping pixel offsets.
4. Build fluid, emotional transition effects for key moments (e.g., unlocking a time capsule, viewing a keepsake, exploring family connections).
5. Maintain strict accessibility (contrast ratios, aria tags, keyboard navigation) and high render performance.
6. Use dynamic layout calculations based on container bounds rather than static pixel math offsets.

## Verification Requirements
- Preview and inspect layout responsiveness across mobile, tablet, and desktop viewports.
- Run `npm run lint` and `npm run build` to verify zero styling or component syntax errors.
- Test micro-animations and interactive state transitions for 60fps smoothness and touch responsiveness.
- Verify visual hierarchy and brand consistency (premium, warm, high-touch black/gold aesthetic).

## Anti-Patterns
- Never use plain browser defaults, generic uncurated colors, or unstyled MVP mockups.
- Never use static pixel math offsets (`+ 12`, `pill_font_size * 2.0`) or hardcoded container dimensions that break across viewports.
- Never mutate third-party DOM properties or execute blocking synchronous operations on main loopers.
- Never clutter emotional memory presentation with administrative noise or cold technical jargon.
