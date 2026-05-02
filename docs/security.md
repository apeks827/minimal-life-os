# Security Baseline

LifeInbox runs local-first when secrets are absent and enables Supabase/AI paths only when configured. Production deployments must keep this baseline enabled:

- Security headers are set in `apps/web/next.config.mjs`: CSP, frame denial, referrer policy, content-type sniffing protection, and a restrictive permissions policy.
- Sensitive API routes use payload size guards and per-route in-memory rate limits. This is enough for preview/MVP protection; production should replace it with a shared store or platform edge rate limit.
- `/api/inbox/retry` requires `CRON_SECRET` in configured environments and compares bearer tokens with timing-safe hashes.
- Client/server logs must not include raw inbox text, access tokens, provider keys, or AI memory payloads.
- AI output remains advisory only; product copy and prompts must avoid medical, legal, or financial guarantees.

Production blockers before public launch:

- Add platform or Redis-backed rate limits for auth, classify, persistence, retry, export/delete.
- Add CodeQL/secret scanning and a documented `pnpm audit` policy.
- Add RLS isolation tests against a Supabase test project for every user-owned table/view.
- Add terms, privacy, crisis/self-harm escalation, age/privacy assumptions, and retention policy review.
