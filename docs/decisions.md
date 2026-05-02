# Decisions

- Use pnpm workspaces and Turborepo for fast local orchestration.
- Keep domain schemas in Zod so API responses, tests, and UI can share validation.
- Default UI language is Russian because the primary experience is RU-first.
- AI provider integration is optional for local development; deterministic fallback protects the capture flow.
- Supabase migrations are SQL-first while Drizzle schema provides typed application access.
- Mobile CI build uses TypeScript validation for now; native Expo/EAS binary export is documented as a deployment step because local Metro export can fail on platform-specific codegen versions.

## Expanded AI contract with local-first fallback
We keep deterministic heuristic classification and local persistence as the default demo path, while shaping provider JSON, DB retry metadata, suggestions, advanced settings, and seed flow for production Supabase mode.

## Decision: preview security baseline before shared infrastructure
We added app-level security headers and process-local API guards now because they close immediate MVP abuse gaps without new services. Production will replace process-local counters with edge or shared-store rate limiting and centralized observability.

## Decision: idempotency at inbox boundary
Idempotency is stored on `inbox_items` rather than every derived entity because the inbox row is the source of truth. Derived entities are only created after the inbox row is accepted, and retry processing updates the existing row.
