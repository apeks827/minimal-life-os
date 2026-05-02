# LifeInbox AI MVP

LifeInbox is a minimal life operating system. It turns a raw inbox note into tasks, goals, habits, notes, events, daily plans, balance insights, and supportive suggestions.

## Quick Start

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

The MVP is designed to run without AI credentials: when `OPENAI_API_KEY` is missing, classification uses deterministic local heuristics and keeps the raw inbox item for retry.

## Workspace

- `apps/web` - Next.js App Router web MVP.
- `apps/mobile` - Expo Router mobile skeleton.
- `packages/shared` - Zod schemas, types, copy, i18n helpers.
- `packages/ai` - prompts, classifier, planner, suggestions, safety fallbacks.
- `packages/db` - Drizzle schema, Supabase helpers, migrations, seed utilities.
- `packages/ui` - shared tokens and lightweight primitives.

## Scripts

- `pnpm dev` - run all development servers through Turborepo.
- `pnpm lint` - lint all workspaces.
- `pnpm typecheck` - strict TypeScript checks.
- `pnpm test` - unit/integration tests.
- `pnpm test:e2e` - Playwright smoke flow.
- `pnpm build` - build apps and packages.
- `pnpm db:check` - validate migration files are present and ordered.

See `docs/deploy.md` for Supabase, Vercel, and Expo setup.
