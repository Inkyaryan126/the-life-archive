---
name: tla-database-change
description: Safely design and implement Supabase schema, migration, query, and RLS changes for The Life Archive.
---

# TLA Database Change

For any database change:

1. Inspect existing schema and recent migrations.
2. Understand current application reads/writes.
3. Create a forward migration.
4. Preserve compatibility with existing records when possible.
5. Add defaults and constraints where appropriate.
6. Add indexes when access patterns justify them.
7. Update application types and mappings.
8. Update tests.
9. Review RLS implications.
10. Never weaken security policies merely to make an operation succeed.

Pay special attention to:
- person ownership
- memories
- contributors/connections
- private media
- share access
- time capsules
- concierge data
- keepsakes
- visitor/admin data

Never:
- reset production DB
- delete production data without explicit instruction
- claim a migration was applied unless verified
- expose service-role secrets client-side

Migration creation and migration application are separate facts.

Report:
- schema changes
- migration filename
- RLS impact
- application changes
- test results
- whether migration was actually applied
