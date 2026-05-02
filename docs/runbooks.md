# Runbooks

## AI Provider Outage

1. Confirm `/api/health` shows `dependencies.ai.configured` and inspect provider dashboard.
2. Keep capture enabled: inbox route should save locally/Supabase and show queued/fallback copy.
3. Pause retry cron if provider returns sustained 5xx/rate-limit errors.
4. Resume retry after provider recovery and watch retry queue age/error rate.

## Supabase Outage

1. Confirm health DB/auth reachability and Supabase status page.
2. Keep local-first mode available for unauthenticated/demo users.
3. Avoid migrations until service recovery.
4. After recovery, run smoke tests and verify recent inbox persistence.

## Migration Failure

1. Stop deploy rollout.
2. Capture failed migration name and error.
3. Apply forward fix migration; do not rewrite an applied migration.
4. Re-run `pnpm db:check`, typecheck, and smoke tests.

## Retry Backlog

1. Check AI provider availability and `CRON_SECRET` scheduler configuration.
2. Trigger `/api/inbox/retry` from the trusted scheduler only.
3. Inspect repeated `last_error` patterns and backoff timestamps.
4. Disable provider or reduce batch size if failures are systemic.

## Data Export/Delete Request

Export/delete is currently documented as a production blocker. Do not promise completion until Supabase Auth user deletion, user-owned table deletion, AI memory/vector deletion, and audit rules are implemented.
