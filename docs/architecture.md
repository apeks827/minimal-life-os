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
