---
name: tla-regression-check
description: Detect regressions and broken user journeys after changes to The Life Archive.
---

# TLA Regression Check

Inspect recent changes and determine what they could have broken.

Prioritize these journeys:
- homepage to person creation
- person page viewing
- memory viewing
- adding a memory
- photo/video/audio upload
- contributor invitations
- claim flows
- login/account ownership
- time capsules
- keepsakes and QR links
- Stripe checkout
- dashboard navigation
- mobile navigation
- admin access boundaries

Check:
- route existence
- authorization
- data loading
- empty states
- old links and QR destinations
- responsive UI
- server/client boundaries
- database field compatibility
- tests related to touched files

Do not create speculative rewrites.

If a regression is clear and safe to fix, fix it.

Run targeted tests and production build when code changes are made.

Report:
- regressions found
- fixes made
- checks
- unresolved risks
