---
name: tla-release
description: Finish, verify, commit, and prepare The Life Archive changes for production.
---

# TLA Release

Before considering work complete:

1. Review git status.
2. Make sure unrelated dirty files are preserved.
3. Run relevant targeted tests.
4. Run npm test when appropriate.
5. Run npm run lint.
6. Run npm run build.
7. Run git diff --check.
8. Fix task-caused failures.
9. Review final diff for accidental changes.
10. Commit successful work with a clear message unless instructed otherwise.

Push/deploy only when the task authorizes it.

Before production release, pay extra attention to changes involving:
- database migrations
- authentication
- RLS
- Stripe
- email delivery
- QR destinations
- scheduled deliveries
- destructive operations

Never force-push.

Keep the final report short:
- commit
- checks
- deployment status
- anything requiring human attention
