---
name: tla-feature-build
description: Build production-ready features for The Life Archive quickly and cleanly.
---

# TLA Feature Build

When implementing a feature:

1. Inspect the relevant existing architecture first.
2. Understand the user flow before editing.
3. Reuse existing components, helpers, data models, and patterns when sensible.
4. Prefer simple production-ready solutions over unnecessary abstraction.
5. Preserve unrelated work and existing functionality.
6. Keep desktop and mobile behavior intact.
7. Update types, database access, server actions, UI, and tests together when required.
8. Fix problems you encounter that directly block the requested feature.
9. If one approach fails twice, switch approaches.
10. Do not stop at partial implementation if the remaining work can reasonably be completed.

For meaningful code changes:
- run targeted tests
- run lint
- run production build
- fix failures caused by the task

You may commit successful work unless the task says not to.

Never:
- force-push
- destroy production data
- weaken authentication or RLS to make something work
- expose secrets
- silently change live Stripe prices

Report only:
- what changed
- checks run
- commit hash if committed
- unresolved issues
