---
name: tla-dead-code-prune
description: Safely audit, verify, and prune obsolete legacy archive-centered code, unused components, deprecated APIs, and orphan assets.
---

# TLA Dead Code Prune

Systematically identify, audit, verify, and safely prune obsolete legacy archive-centered code, unused components, deprecated RPC/API endpoints, and orphan assets replaced by TLA 2.0.

## Triggers
Activate this skill when:
- Removing obsolete legacy archive UI components, legacy database models, unused helper utilities, or orphan styles superseded by TLA 2.0.
- Cleaning up unused routes, legacy RPC endpoints, or unused package dependencies.
- Refactoring codebase to eliminate legacy archive-centered tech debt and improve maintainability.

## Operating Rules
1. Conduct full codebase references audit (grep/ripgrep across imports, routes, types, database schemas) BEFORE deleting any file, component, or function.
2. Ensure target code is completely unused or that replacement TLA 2.0 people-centered components/routes are fully operational and verified.
3. Remove dead code in logical, isolated increments—do not combine structural pruning with unrelated feature edits.
4. Update barrel files (`index.ts`), route registries, type exports, and build manifests when deleting files.
5. Verify that no third-party integrations, scheduled jobs, webhooks, or dynamic imports depend on pruned code.
6. Preserve all pre-existing dirty/untracked files unrelated to the prune task.

## Verification Requirements
- Execute full reference check (`ripgrep` / `grep`) confirming zero remaining references across the project.
- Run `npm run build` and `tsc` to verify zero missing import or missing type errors.
- Run test suite (`npm test`) to ensure no broken assertions or missing module dependencies.
- Inspect `git status` and `git diff` to confirm only verified dead files/code were removed.

## Anti-Patterns
- Never delete code based on guesswork or partial file views without a comprehensive search of invocation sites.
- Never prune active legacy fallback code before the corresponding people-centered migration is verified in production.
- Never break public API contracts, external webhooks, or live user links during code cleanup.
- Never delete active database tables or user data under the guise of dead code pruning.
