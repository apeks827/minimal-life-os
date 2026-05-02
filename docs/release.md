# Release Process

1. Work lands through PR with checklist, tests, and migration notes.
2. Required local checks: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm db:check`, `pnpm test:e2e`.
3. Required CI checks: validate workflow, dependency checks, migration check, and E2E.
4. Before production deploy, verify env matrix for Vercel/Supabase/AI/Sentry/cron and run `/api/health` after deploy.
5. Rollback by reverting the application deployment first; database changes must be forward-fixed unless a documented safe rollback exists.

Branch protection should require passing CI, review, no secrets, and updated docs/decisions for migrations, auth, AI provider, scheduler, monitoring, retention, or privacy changes.
