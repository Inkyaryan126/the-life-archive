---
name: tla-people-migration
description: Safely migrate legacy archive-centered schemas, data, endpoints, and queries to the TLA 2.0 People-centered model.
---

# TLA People Migration

Safely transform and migrate legacy archive-centered database tables, queries, server actions, and client components to the TLA 2.0 People-centered architecture (`People -> Connections -> Memories -> Experiences -> Keepsakes -> Time Capsules/Future Surprises`).

## Triggers
Activate this skill when:
- Migrating database schema or data from legacy tables (`archives`, `archive_members`, `archive_items`) to `people`, `connections`, `memories`, `experiences`, `keepsakes`, or `time_capsules`.
- Refactoring legacy backend queries, server actions, RPC functions, or data mappers.
- Deprecating legacy endpoints or UI components dependent on archive-centric data schemas.
- Handling zero-downtime data transformations for existing accounts and archives.

## Operating Rules
1. Map legacy archive concepts 1-to-1 to people-centered entities prior to executing schema or data migrations.
2. Write zero-downtime, non-destructive forward migrations that populate `people` and `connections` while preserving legacy tables until full deprecation.
3. Ensure idempotency for all data migration scripts, backfills, and fallback read strategies during the transition phase.
4. Update the application data layer (queries, mutations, types, hooks) to source from `people` and related tables.
5. Audit RLS policies on new `people`-centered tables to match or exceed legacy security controls.
6. Verify foreign key integrity, index performance, and orphan records after data transformations.

## Verification Requirements
- Validate data integrity post-migration: verify record counts, foreign key constraints, and orphan checks.
- Test legacy fallback read logic to ensure uninterrupted service during rollout.
- Run targeted tests on migrated data queries and mutation actions.
- Execute `npm run lint` and `npm run build` to confirm zero schema mismatch or broken data mappings.

## Anti-Patterns
- Never run destructive `DROP TABLE` or `TRUNCATE` commands on legacy archive tables during migration.
- Never hard-code schema transformation scripts without idempotent retry and rollback capabilities.
- Never orphan existing user memories, media files, or contributor access during migration.
- Never weaken RLS policies or user permissions during data transformation.
