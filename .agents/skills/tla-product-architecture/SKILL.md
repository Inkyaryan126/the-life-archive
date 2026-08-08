---
name: tla-product-architecture
description: Architect and enforce TLA 2.0 people-centered domain models, data relationships, and system boundaries.
---

# TLA Product Architecture

Guide, design, and enforce the TLA 2.0 people-centered core product architecture: `People -> Connections -> Memories -> Experiences -> Keepsakes -> Time Capsules/Future Surprises`. Legacy archive-centered architecture is obsolete and candidate for removal.

## Triggers
Activate this skill when:
- Designing or refactoring domain models, database schemas, server actions, or API routes.
- Transitioning legacy archive-centered structures (`archives`, `archive_items`, legacy entities) to TLA 2.0 people-centered concepts.
- Adding or modifying top-level features connecting People, Connections, Memories, Experiences, Keepsakes, or Time Capsules.
- Establishing system boundaries, data ownership, or RLS permission hierarchies for core entities.

## Operating Rules
1. Enforce the canonical TLA 2.0 entity flow: `People -> Connections -> Memories -> Experiences -> Keepsakes -> Time Capsules/Future Surprises`.
2. Treat `Person` as the primary root entity instead of abstract "Archives".
3. Model `Connections` as relationships between People, `Memories` as captured moments/media linked to People and Connections, `Experiences` as interactive and narrative engagements, `Keepsakes` as physical/digital artifacts, and `Time Capsules/Future Surprises` as scheduled or event-triggered deliveries.
4. Identify legacy archive-centered architecture patterns, mark deprecation targets, and define safe migration pathways without disrupting active user data.
5. Ensure RLS policies and ownership checks bind directly to `person_id` or authorized user permissions.
6. Enforce strict type boundaries and clean data interfaces for all entities across frontend components, server actions, and backend services.

## Verification Requirements
- Verify TypeScript types, domain interfaces, and schema migrations compile cleanly (`npm run build` or `tsc`).
- Verify RLS policies and data access rules for `person_id` and `connection_id` relationships.
- Ensure no new code introduces dependencies on legacy archive-only tables without explicit migration/deprecation logic.
- Run targeted automated tests and regression checks on entity CRUD operations.

## Anti-Patterns
- Never introduce new features centered on legacy "Archive" entities.
- Never bypass the `People -> Connections` model to create unanchored or floating memories.
- Never weaken RLS or user privacy rules across Person and Connection boundaries.
- Never break backward compatibility for existing user data during architecture refactoring.
