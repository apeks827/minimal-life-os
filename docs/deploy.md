# Deploy

## Supabase

1. Create a Supabase project.
2. Copy project URL and anon key into Vercel/Expo env.
3. Apply SQL files from `supabase/migrations` in order.
4. Set `DATABASE_URL` for Drizzle tooling and seed scripts.

## Vercel

1. Import the repository.
2. Set root command to `pnpm build` and app path to `apps/web` if using project settings.
3. Add Supabase and optional AI provider env vars.
4. Verify `/api/health` after deployment.

## Expo

1. Add public Supabase env vars to EAS secrets.
2. Run `pnpm --filter @life/mobile dev` locally or configure EAS builds.
