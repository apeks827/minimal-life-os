# Changelog

## 0.1.0

- Bootstrapped LifeInbox AI MVP monorepo foundation.
- Added shared schemas, AI fallback classifier, Supabase migration, web shell, mobile skeleton, and validation tests.

- Added interactive local-first web dashboard with inbox classification, derived panels, and auth/onboarding/settings placeholders.

- Added Supabase-ready inbox repository contracts plus interactive local onboarding/settings persistence.
- Added Dependabot automerge workflow for passing dependency PRs.

- Wired Supabase auth actions and `/api/inbox/items` persistence endpoint with local-mode fallback.

- Added Supabase RLS/profile migration, entity inbox links, and authenticated server dashboard loading.

- Added Supabase-backed settings/onboarding saves and installed Playwright browsers in CI before e2e tests.

- Upgraded stable dependencies, moved CI to Node 24, fixed Next 16 e2e flow, and expanded the Expo mobile LifeInbox skeleton with local classification parity.

- Expanded LifeInbox AI contract, onboarding quiz, Advanced Settings, suggestion cloud, health status, retry/memory migrations, seed flow, and E2E coverage.

- Added Supabase auth/onboarding gate, optional OpenAI-compatible AI provider, core web screen routes, actionable suggestions, and Expo tab routes.

- Moved web UI translations to a typed i18n module and made classification locale resolution honor selected/profile language.
