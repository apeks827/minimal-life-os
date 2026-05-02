# Limitations

- The current web app is an MVP shell with local heuristic classification; production Supabase writes and auth screens are prepared but not fully wired.
- Mobile is an Expo Router skeleton that shares copy/types and validates with TypeScript; native EAS builds need real project credentials.
- AI provider calls are intentionally optional; `OPENAI_API_KEY` enables future provider integration, while fallback keeps capture usable.
- RLS is enabled in migrations, but fine-grained policies should be expanded before production launch.

## Current limitations
Supabase seed automation requires owner-provided service-role credentials. Mobile remains local-first; cloud auth/persistence parity is documented as future work. Vector memory is represented by migration placeholder and requires pgvector-enabled Supabase projects.

## Remaining production work
The retry worker/cron and real vector search are still deployment tasks: the schema and metadata exist, but background execution depends on Supabase Edge Functions or another scheduler. Mobile tabs are local-first and do not yet share cloud auth sessions.

## Vector extension
Migration `0003` now enables `vector`; Supabase projects without pgvector support must enable the extension before applying AI memory features.

## Production blockers
Current rate limiting is process-local and should be replaced with edge/Redis limits before public launch. Export/delete flows, full RLS isolation tests, Sentry/OpenTelemetry wiring, legal/privacy launch copy, and account deletion remain production blockers.
