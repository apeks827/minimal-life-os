# Architecture

The repository is a pnpm + Turborepo monorepo. Domain contracts live in `packages/shared`, AI behavior in `packages/ai`, persistence in `packages/db`, and app surfaces in `apps/web` and `apps/mobile`.

## Data Flow

1. User submits text to Inbox.
2. Web app stores raw `inbox_items` row with `pending` status.
3. Classifier tries provider-backed structured JSON when credentials exist.
4. Zod validates the result; invalid/provider failures fall back to deterministic heuristics.
5. App creates typed entities and surfaces them in relevant screens.
6. User can retry AI classification later because the raw item remains saved.


## Current MVP Runtime

The web app is local-first while Supabase credentials are optional. `LifeDashboard` stores inbox records and created entities in browser localStorage, using `/api/inbox/classify` for the same classifier contract that production persistence will call. This keeps the core capture-to-plan loop demonstrable before auth and RLS-backed writes are fully connected.


## Repository Path To Supabase

The web app now talks to an `InboxRepository` contract. Local MVP mode uses `createLocalInboxRepository` with browser storage. Production wiring can swap to `createSupabaseReadyInboxRepository`, which keeps the classify API contract and sends `{ text, classification }` to a future authenticated `/api/inbox/items` endpoint for transactional creation of `inbox_items` plus derived entities.


## Auth And Persistence Wiring

`apps/web/src/lib/supabase-client.ts` creates browser/server clients only when Supabase env is present. Auth server actions sign users in/up through Supabase and otherwise explain that local MVP mode is active. The dashboard repository chooses Supabase persistence when env exists, falling back to local storage when it does not.

## AI contract update
Shared schemas now model the full LifeInbox item contract, 12 life areas, advanced settings, suggestion cloud, and backwards-compatible mapping to existing task/goal/habit/event/memory tables.

## Auth and AI provider gate
When Supabase env exists, server pages require an authenticated user and completed onboarding before showing the app shell. The classify API can call an OpenAI-compatible provider via `OPENAI_API_KEY` or `AI_PROVIDER_API_KEY`, falling back to heuristic classification without breaking local mode.

## Retry processor
The web API exposes a cron-safe retry endpoint that re-runs pending or failed inbox classifications, updates attempts/error metadata, and backs off future retries.

## Web i18n
UI translations now live in `apps/web/src/lib/i18n.ts` as a typed dictionary plus helpers for navigation, inbox type labels, onboarding questions, and area labels. Domain-only labels stay in `@life/shared`; component-local copy constants should not be added.

## Production Readiness Baseline
The web app now applies security headers globally, uses lightweight API payload/rate guards, and exposes richer readiness data in `/api/health`. These are preview/MVP controls; production should move rate limiting and observability to shared infrastructure.
