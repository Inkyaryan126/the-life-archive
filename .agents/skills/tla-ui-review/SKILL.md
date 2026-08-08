---
name: tla-ui-review
description: Review and improve The Life Archive visual experience across desktop and mobile.
---

# TLA UI Review

Review the actual human experience, not just whether components render.

Check:
- faces and important photo subjects are not cropped badly
- images use appropriate aspect ratios
- text does not clip, overflow, or become unreadable
- typography hierarchy is clear
- buttons are obvious and usable
- owner controls are visible only when appropriate
- mobile layout works at narrow widths
- desktop layout uses available space well
- overlays and modals stack correctly
- empty states explain what to do
- loading states do not look broken
- touch targets are usable
- contrast remains readable
- visual language fits TLA's premium black/gold/human-centered brand
- old archive-centered terminology is not accidentally reintroduced

Prioritize problems a normal user would immediately notice.

When fixing UI:
1. Find the root cause.
2. Prefer shared fixes over one-off patches.
3. Avoid changing unrelated styling.
4. Verify responsive behavior.
5. Run appropriate tests/lint/build.

Report the most important visual issues first.
