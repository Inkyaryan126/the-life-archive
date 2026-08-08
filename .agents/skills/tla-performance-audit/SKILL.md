---
name: tla-performance-audit
description: Audit Next.js rendering, Supabase queries, image/media assets, and web vitals for optimal performance.
---

# TLA Performance Audit

Perform practical performance, rendering, database query, asset optimization, and core web vitals audits across Next.js, Supabase, and Stripe integrations.

## Triggers
Activate this skill when:
- Auditing page load speeds, high Largest Contentful Paint (LCP), or slow Interaction to Next Paint (INP).
- Investigating slow Supabase queries, N+1 query patterns, or missing database indexes.
- Optimizing memory photo galleries, audio playback components, or keepsake preview rendering.
- Reviewing Next.js bundle sizes, third-party script loading (Stripe.js, analytics), or dynamic imports.

## Inputs to Inspect
- Next.js page components, dynamic layouts, and `next.config.js`.
- Image components (`next/image`), media display components, and font configurations (`app/layout.tsx`).
- Supabase client queries, RPC calls, and SQL schema indexes (`supabase/migrations/*.sql`).
- Client vs Server Component boundaries (`"use client"` directives in `components/**`).
- Third-party script load strategies (`next/script`).

## Step-by-Step Procedure
1. **Audit Next.js Server & Client Boundaries**: Ensure heavy data fetching and rendering logic happen in React Server Components (RSC). Limit `"use client"` directives to interactive leaf nodes to minimize JavaScript bundle size.
2. **Audit Supabase Query Efficiency**: Inspect all database queries for N+1 execution patterns, unbounded `SELECT *` calls, or missing indexes on frequently filtered foreign keys (`person_id`, `connection_id`, `created_at`).
3. **Audit Media & Image Optimization**: Verify all user photos and keepsake previews utilize `next/image` with explicit `sizes`, modern formats (WebP/AVIF), and lazy loading for off-screen items. Ensure responsive resolution scaling for high-DPI screens.
4. **Audit Script & Font Loading**: Defer non-critical third-party scripts (analytics, Stripe.js elements) using `next/script` with `strategy="lazyOnload"` or `afterInteractive`. Verify Google Fonts use `next/font` for zero layout shift (CLS).
5. **Inspect Dynamic Imports**: Identify heavy client components (e.g., QR generators, rich text editors, keepsake 3D previewers) and wrap them with Next.js dynamic imports (`next/dynamic` with `ssr: false`).

## Output & Report Format
Generate a **TLA Performance Audit & Optimization Plan**:

```markdown
# Performance Audit & Optimization Plan

## 1. Performance Bottleneck Summary
- **Target Page / Component**: [e.g., Memory Gallery `/person/[id]/memories`]
- **Primary Bottleneck**: [Unoptimized raw images / Missing DB index / Excessive client JS bundle]
- **Core Web Vitals Impact**: [LCP: 3.8s -> Target: < 1.8s]

## 2. Optimization Findings & Remediation Plan
| Bottleneck Target | Metric Impact | Root Cause Analysis | Code / Index Remediation | Expected Gain |
|---|---|---|---|---|
| Memory Gallery DB Query | 850ms TTFB | Unindexed filter on `person_id` in `memories` table | Add index `CREATE INDEX idx_memories_person ON memories(person_id)` | ~80ms TTFB |
| Photo Grid Layout | LCP 3.4s | Standard `<img>` tags loading 4MB raw assets | Replace with `<Image src=... sizes="..." />` | < 1.2s LCP |

## 3. Bundle & Script Optimization Checklist
- [x] Stripe.js loaded asynchronously via deferred script
- [x] Rich text editor wrapped in `next/dynamic()`
- [x] Fonts preloaded via `next/font`

## 4. Verification & Metrics
- [ ] `npm run build` size report verified
- [ ] Zero layout shifts (CLS < 0.05) on gallery load
```

## Verification Requirements
- Run `npm run build` and inspect route output bundle sizes and static/dynamic generation markers.
- Verify Supabase query execution times before and after index additions.
- Ensure images render cleanly with proper aspect ratios and zero visual layout shifts.
- Run `npm run lint`.

## Anti-Patterns
- Never strip essential emotional visual details or high-resolution media solely for arbitrary performance score chasing.
- Never use standard unoptimized `<img>` tags for user-uploaded memory photos.
- Never perform blocking, sequential Supabase database queries inside loops (N+1 pattern).
- Never disable Next.js page caching without explicit performance justification.
