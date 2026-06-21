# The Life Archive Project Audit

**Audit date:** June 21, 2026  
**Scope:** Repository-only review of Supabase, authentication, archive creation, memory creation, QR behavior, deployment readiness, security, and missing launch features.  
**Constraint honored:** No application code or database schema was changed.

## Executive Summary

The Life Archive is a coherent MVP with a working Next.js UI, a reasonable Supabase foundation, email/password authentication, archive and memory server actions, and a printable QR-to-random-memory flow. The production build and lint checks pass.

It is **not ready for a public launch**. The main blocker is that security and persistence depend on `USE_SUPABASE` being exactly `"true"`. The default JSON path has no access control, exposes private archives by slug and on the home page, permits unauthenticated writes, and is not durable on Vercel. Other launch blockers are the critically vulnerable Next.js version, unrestricted attacker-controlled remote URLs, incomplete authentication UX, absent upload/storage support, and stale deployment documentation.

**Readiness assessment:**

| Area | Status | Summary |
| --- | --- | --- |
| Supabase schema and RLS | Mostly sound foundation | Ownership, membership, and public/private read policies exist; live deployment was not verified. |
| Runtime Supabase integration | Partial | Implemented behind a fragile feature flag; types, error handling, and migration tooling are incomplete. |
| Authentication | Partial | Sign in, sign up, callback, and a server-side sign-out action exist; route UX and session lifecycle are incomplete. |
| Archive creation | MVP only | Works in both backends; JSON mode is insecure and Supabase slug allocation is race-prone. |
| Memory creation | MVP only | RLS correctly limits Supabase writes, but UI authorization and error handling are missing. |
| QR flow | Functional for demos/public archives | Generates and prints correctly; private QR codes require an existing authorized session and are not shareable by token. |
| Deployment | Buildable, not launch-ready | Build and lint pass; dependency, configuration, persistence, and operational gaps remain. |
| Security | High risk until blockers are fixed | Unsafe fallback, critical dependencies, unrestricted image/media URLs, and missing abuse controls. |

## P0 Launch Blockers

### 1. JSON fallback bypasses all privacy and write authorization

`lib/archive-data.ts:13-14` selects local JSON unless `USE_SUPABASE === "true"`. In that fallback:

- `getFeaturedArchives` returns every archive, including private archives (`lib/archive-data.ts:266-267`).
- `getArchiveBySlug` and memory reads perform no user check (`lib/archive-data.ts:294-325`).
- Archive creation requires no account (`lib/archive-data.ts:390-411`).
- Memory creation only checks that the slug exists, so any visitor can write to any archive (`lib/archive-data.ts:466-470` and the remainder of `createMemory`).
- File writes are non-transactional and can lose updates when concurrent requests read and overwrite the same JSON document.
- Vercel filesystem writes are ephemeral and cannot be treated as production persistence.

This makes `USE_SUPABASE` a security control with an insecure default. Production must fail closed when Supabase configuration is absent; JSON should be limited to an explicit development/demo mode that cannot be enabled accidentally in a public deployment.

### 2. The pinned Next.js release has a critical vulnerability chain

`package.json` declares `next` as `^14.2.4`, and the current lockfile/install resolves to vulnerable version `14.2.4`. `npm audit --omit=dev` reports:

- 1 critical vulnerability affecting Next.js, covering multiple cache poisoning, authorization bypass, denial-of-service, SSRF, request smuggling, and XSS advisories.
- 1 moderate vulnerability in the PostCSS version bundled under Next.js.

The audit-proposed patched 14.x version is `14.2.35`. Dependency upgrades require a separate implementation and regression-test pass before launch.

### 3. User-controlled remote URLs are insufficiently constrained

`next.config.mjs` permits every HTTP and HTTPS hostname for `next/image`. Archive profile URLs and memory media URLs are accepted from form data without server-side URL parsing or an allowlist. Consequences include:

- The image optimizer can be used to request arbitrary remote hosts, increasing SSRF and resource-exhaustion exposure.
- Plain `http` media permits mixed content and transport downgrade.
- Non-photo `mediaUrl` values become clickable links in `components/MemoryCard.tsx`; relying on `<input type="url">` is not server-side scheme validation.
- There are no file-size, response-size, content-type, or trusted-host controls for externally hosted content.

Before public input is accepted, allow only normalized `https:` URLs from approved origins or move media to a controlled storage/upload pipeline. Do not keep the wildcard image configuration for production.

### 4. Production configuration and documentation can silently select the unsafe backend

`.env.example` contains only `NEXT_PUBLIC_SITE_URL`. It omits `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `USE_SUPABASE`. Meanwhile, `README.md` and `SUPABASE_SETUP.md` still say the app is not wired to Supabase, although runtime integration and auth now exist.

There is no checked startup validation for the complete production configuration. A deployment can build successfully and then use JSON because a single flag is absent or misspelled. The repository also does not provide an environment-specific deployment checklist that verifies RLS behavior, auth redirect URLs, and QR destination URLs.

## Supabase Audit

### What is in place

- A single migration creates `archives`, `archive_members`, and `memories` with foreign keys, constraints, useful indexes, and `updated_at` triggers.
- RLS is enabled on all three tables (`supabase/migrations/20260620130000_create_life_archive_foundation.sql:112-114`).
- Public users can read only public archives and their memories (`:165-170`, `:258-270`).
- Owners can read/update/delete their non-demo archives, while members can read shared archives (`:172-218`).
- Owners and editors can create/update/delete memories, and inserts require `created_by = auth.uid()` (`:286-309`).
- Demo archives are ownerless by constraint and cannot be modified through normal authenticated policies.
- The application runtime uses the anon key plus the authenticated user's cookies. The service-role key is confined to the migration script and is not referenced by app routes.
- `.env` is ignored and not tracked. The audit inspected variable names only, not secret values.

### Gaps and risks

- There is no evidence in the repository that the migration and policies currently deployed in the remote Supabase project match this SQL. This audit did not connect to or modify the remote database.
- Supabase-generated database types are absent. Data mapping uses `any` throughout `lib/archive-data.ts`, allowing schema/application drift through type checking.
- The schema permits nullable `bio`, `profile_photo_url`, `content`, and `memory_date`, while UI types and renderers assume several are strings. A row created outside current server actions can cause broken images or invalid date rendering.
- RLS helper functions are `SECURITY DEFINER`. Their fixed `search_path` is good, but function ownership and execute grants should be explicitly reviewed in the deployed project as part of a security verification.
- There are no automated RLS tests covering anon, owner, viewer, editor, unrelated authenticated user, and demo records.
- `archive_members` exists only at the database layer; there is no invitation or collaborator-management product flow.
- Storage buckets and storage policies do not exist. Photo, audio, and video are currently labels plus external URLs, not managed uploads.

### Data migration script

`scripts/migrate-local-to-supabase.ts` is not production-safe:

- It inserts non-demo archives with owner ID `00000000-0000-0000-0000-000000000000`, which normally violates the foreign key to `auth.users`.
- It is not idempotent and does not use upserts or a transaction.
- It continues after individual failures, allowing a partially migrated dataset.
- It does not preserve memory IDs or ownership attribution.
- It has no dry-run, verification, rollback, or reconciliation mode.
- No package script invokes it, and the docs do not provide an executable, validated migration procedure.

Do not run this script against production in its current form.

## Authentication Audit

### Implemented

- Email/password sign-in and sign-up server actions call Supabase Auth.
- The callback exchanges the PKCE code for a session.
- Creation functions call `auth.getUser()` before Supabase writes (`lib/archive-data.ts:339-349`, `:414-424`).
- A server-side sign-out action exists.
- RLS, rather than client-supplied owner IDs alone, is the final Supabase authorization boundary.

### Missing or incomplete

- `/create` and `/archive/[slug]/add-memory` are not gated or redirected based on authentication and role. Anonymous users and view-only members see forms that fail only after submission.
- Authentication failures thrown from the data layer are not caught by the server actions, so expected authorization outcomes can become generic 500 responses.
- The sign-out action is not exposed in the visible UI, and there is no signed-in state, account menu, or archive dashboard.
- There is no password reset, resend-confirmation, email-change, password-change, or account-deletion flow.
- Sign-up redirects to `/` even when email confirmation is required, without explaining that the user must confirm before creating an archive.
- `emailRedirectTo` is built directly from `NEXT_PUBLIC_SITE_URL`; a missing value produces an invalid callback URL.
- There is no middleware/session refresh layer. Long-lived SSR sessions and expired-token behavior need explicit integration testing with the installed `@supabase/ssr` version.
- Supabase error messages are reflected directly into the login page query string. This is poor UX and may expose more provider detail than necessary.
- No rate limiting, CAPTCHA/bot protection, breached-password policy, or abuse monitoring is visible in the repository. Some controls may exist in the Supabase dashboard, but were not verifiable here.

## Archive Creation Audit

### Current flow

The server action trims required values, defaults unknown visibility values to private, and delegates to the data layer. In Supabase mode, the authenticated user becomes `owner_id`, demos cannot be created, and RLS checks ownership. The generated slug is human-readable and the database enforces a valid unique slug.

### Risks and missing behavior

- Supabase slug selection reads only slugs visible through RLS (`lib/archive-data.ts:351-358`). A private archive owned by another user is invisible, so the application can select an already-used slug and fail the unique constraint.
- Slug generation is a read-then-insert sequence and is race-prone even when both rows are visible.
- Database errors are thrown without translating duplicate, validation, or connectivity errors into actionable form responses.
- No server-side maximum lengths exist for names, biography, URLs, or tags; the database also lacks practical content-length constraints.
- There is no edit, delete, ownership transfer, archive export, archive dashboard, or restore flow in the UI.
- “Private” behavior is not explained at creation time, including who can scan a QR code and whether login is required.
- The page copy still says archives are stored locally even when Supabase mode is active.

## Memory Creation Audit

### Current flow

The server action validates a title, one of six types, and at least content or a media URL. It normalizes comma-separated tags and defaults the date. In Supabase mode, RLS correctly restricts inserts to owners and editors and enforces the current user as creator.

### Risks and missing behavior

- UI controls are shown to anonymous users and read-only viewers. Authorization is deferred to the insert and errors are not handled cleanly.
- There is no edit/delete UI despite database policies supporting both.
- Repeated submissions have no idempotency protection and can create duplicates.
- Content, title, tags, and media URLs have no size or count limits, creating abuse and storage-cost exposure.
- URL validation is browser-only and does not enforce protocol, origin, media type, or availability.
- There are no native uploads, background processing, media metadata, transcription, thumbnails, or accessibility fields.
- A public archive makes every attached memory public. There is no UI warning at memory creation and no memory-level visibility model.
- Random selection loads every readable memory and chooses in application memory. This is acceptable for a demo but scales poorly for large archives.

## QR Flow Audit

### What works

- QR codes target `/archive/[slug]/random` and are generated as SVG.
- The target uses `NEXT_PUBLIC_SITE_URL` when configured, strips a trailing slash, and supports request-derived local previews.
- QR pages are dynamic and include a printable card and plain destination URL.
- Supabase RLS prevents an anonymous request from resolving a private archive or its memories.

### Risks and launch gaps

- A private QR contains only the archive slug. It grants no access by itself; the scanner must already be logged in as owner or member. This is secure but likely does not meet family/keepsake sharing expectations.
- There is no revocable, expiring, scoped share-link flow. The migration explicitly notes that no share-token model exists (`supabase/migrations/...sql:311-316`).
- If `NEXT_PUBLIC_SITE_URL` is missing, QR output trusts request host/protocol headers. A misconfigured proxy or hostile Host header can produce a QR code for the wrong domain.
- There is no automated test that decodes a generated QR and verifies the canonical production URL.
- There is no downloadable PNG/PDF asset, print-size calibration, scan analytics, scan fallback/help page, or QR revocation workflow.
- An archive with no memories prints a valid QR that lands on an owner-oriented “add a memory” prompt, which is not a polished recipient experience.

## Deployment Readiness

### Confirmed in this audit

- `npm run build`: passed.
- `npm run lint`: passed with no warnings or errors.
- The build emits dynamic routes for the archive, memory, QR, create, login, and auth callback flows.
- Secrets are not tracked in Git; `.env` is ignored.

### Not ready or not verified

- Dependency audit fails with critical and moderate vulnerabilities.
- There are no automated unit, integration, end-to-end, RLS, or QR decode tests.
- There is no CI configuration, preview-deployment test suite, or migration gate.
- There is no verified production environment contract. `.env.example` is incomplete.
- There are no security headers such as Content Security Policy, explicit frame restrictions, Referrer-Policy, or Permissions-Policy.
- `next/image` accepts wildcard HTTP/HTTPS origins.
- There is no application logging strategy, error reporting, audit log, uptime check, health endpoint, alerting, or incident procedure.
- There is no backup/restore validation or documented Supabase point-in-time recovery policy.
- The repository does not prove that Supabase Auth redirect URLs, email templates, SMTP delivery, rate limits, and production domain settings are configured.
- README, Supabase setup, migration checklist, and current implementation contradict each other.

## Missing Launch Features

### Required before accepting real user data

1. Enforced production-only Supabase mode with startup configuration validation and no public JSON fallback.
2. Patched framework dependencies and a clean production dependency audit.
3. Route-aware auth UX: signed-in state, protected creation, role-aware write controls, sign out, confirmation guidance, and password recovery.
4. Controlled media storage with upload limits, validated MIME types, private/public storage policies, and safe delivery URLs.
5. Server-side input limits and URL normalization/allowlisting.
6. Edit/delete flows for archives and memories, plus account/data deletion and export.
7. Tested private sharing behavior: authenticated member invitation or a deliberately designed revocable QR/share link.
8. Automated authorization tests for every RLS role and public/private combination.
9. Privacy policy, terms, consent/rights handling for memorialized people, abuse reporting, and a contact/support path.
10. Production monitoring, error reporting, backups, recovery verification, and an incident owner.

### Important shortly after launch

1. User archive dashboard and collaborator invitation/role management.
2. QR download formats, scan testing, revocation/replacement, and recipient-friendly empty states.
3. Media processing for photos, audio, and video, including accessibility and transcription.
4. Search, filtering, pagination, and scalable random-memory selection.
5. Product analytics with a privacy-aware event plan and no sensitive memory content in telemetry.
6. Moderation and takedown workflow for public archives.
7. Data retention, ownership transfer, memorial stewardship, and deceased-owner recovery policies.

## Recommended Launch Gate

Do not open public archive creation until all of the following are true:

- Production refuses to start without valid Supabase and canonical site URL configuration.
- An anonymous browser cannot enumerate, read, or modify private data.
- Owners, viewers, editors, unrelated users, and anonymous users pass automated RLS and route tests.
- Framework vulnerabilities are patched and `npm audit --omit=dev` has no high/critical findings.
- Remote URL handling is restricted and native media storage has enforceable policies.
- Auth confirmation, recovery, sign-out, and expected authorization errors work end to end.
- QR codes decode to the canonical domain and private QR behavior is explicitly defined and tested.
- Backup/restore, error monitoring, legal pages, and account/data deletion are operational.

## Audit Limitations

This was a static repository audit plus local build, lint, and dependency checks. It did not inspect or alter the live Supabase project, Vercel project, DNS, email provider, Supabase dashboard settings, deployed environment values, production logs, or live RLS state. Those require a separate read-only production verification before launch approval.
