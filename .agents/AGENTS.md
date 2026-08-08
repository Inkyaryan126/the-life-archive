# The Life Archive Agent Rules

## Core Product Model (TLA 2.0)
The core product model for The Life Archive is **People -> Connections -> Memories -> Experiences -> Keepsakes -> Time Capsules/Future Surprises**.
Archive-centered architecture is legacy and candidate for removal when obsolete. All new features, schema changes, UI designs, copy, and architecture must align with the People-centered model.

## Default behavior
- Inspect before editing.
- Do not modify unrelated files.
- Preserve existing working changes unless the task explicitly includes them.
- Do not commit or push unless explicitly authorized.
- Do not deploy unless explicitly authorized.
- Do not run destructive database operations.
- Do not weaken authentication, authorization, or RLS to make something work.
- Do not expose secrets or private user data.
- Prefer reusable shared logic over duplicated implementations.
- Test all meaningful changes.

## Available Agent Skills
Invoke the appropriate skill when performing specific tasks:

### Core & Feature Development
- **`tla-product-architecture`**: Architect, design, or refactor domain models, schemas, and boundaries for the TLA 2.0 people-centered model (`People -> Connections -> Memories -> Experiences -> Keepsakes -> Time Capsules/Future Surprises`).
- **`tla-feature-build`**: Implement production-ready TLA features quickly and cleanly.
- **`tla-database-change`**: Safely design and implement Supabase schema, migration, query, and RLS changes.
- **`tla-people-migration`**: Safely migrate legacy archive-centered data, schemas, endpoints, and queries to the TLA 2.0 People-centered model.
- **`tla-dead-code-prune`**: Audit, verify, and safely remove obsolete legacy archive-centered code, unused components, and orphan assets.

### Design, Commerce & Copy
- **`tla-experience-design`**: Design and build high-touch, emotionally resonant, and visually extraordinary interactive UI/UX.
- **`tla-keepsake-commerce`**: Implement physical & digital Keepsake commerce, checkout, fulfillment orders, QR links, and Stripe payment flows.
- **`tla-copy-positioning`**: Craft, refine, and audit user-facing copy, onboarding narratives, value propositions, and emotional positioning for TLA 2.0.
- **`tla-ui-review`**: Review visual experience, responsive behavior, and accessibility across desktop and mobile.

### Quality, Memory & Growth
- **`tla-agent-memory`**: Record and inspect durable technical and operational lessons to prevent repeating past failures.
- **`tla-regression-check`**: Verify existing user flows and guard against regressions during updates.
- **`tla-conversion-analysis`**: Analyze funnel metrics, user behavior, activation, retention, and monetization.
- **`tla-growth-experiment`**: Design and run growth/conversion experiments safely.
- **`tla-release`**: Verify, check, commit, and prepare changes for production release.

## Required completion checks for code changes
1. git status --short
2. targeted tests
3. npm test when practical
4. npm run lint
5. npm run build
6. git diff --check

## Report format
Always finish with:
- Summary
- Files changed
- Tests/checks
- Known risks
- Git status
- Commit/push status

