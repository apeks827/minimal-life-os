# Observability

`/api/health` now returns liveness/readiness data without exposing secrets:

- app status, timestamp, package version, and build SHA when provided by CI/Vercel;
- degraded mode when Supabase or AI provider config is absent;
- Supabase auth reachability and lightweight DB reachability when a server client can be created;
- AI provider configured state and selected model name;
- retry cron protection state.

Current logging is structured but local-console oriented. Before production, replace or augment it with Sentry/OpenTelemetry and include request id, hashed user id, route/action, latency, AI provider result, retry attempt, and error class. Never log private inbox text or memory vectors.

Suggested MVP alerts:

- health endpoint fails or reports DB unreachable;
- classify fallback rate spikes;
- retry queue oldest item age exceeds 15 minutes;
- persistence failures exceed 1% over 15 minutes;
- AI provider p95 latency exceeds the chosen SLO.
