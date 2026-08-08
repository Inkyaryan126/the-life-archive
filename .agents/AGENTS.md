# The Life Archive Agent Rules

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
