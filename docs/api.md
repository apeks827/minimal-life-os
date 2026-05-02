# API

## `POST /api/inbox/classify`

Classifies raw inbox text and returns a validated AI result.

Request:

```json
{ "text": "Записаться к врачу завтра", "locale": "ru" }
```

Response:

```json
{
  "status": "classified",
  "source": "heuristic",
  "items": [{ "type": "task", "title": "Записаться к врачу", "confidence": 0.72 }]
}
```

Provider failures return a classified fallback plus retry metadata instead of blocking capture.


## Local MVP Store

The browser stores a serialized `LifeState` under `lifeinbox.mvp.state`. It contains raw inbox records, derived life records, and settings. This is intentionally replaceable by Supabase repository methods.


## `POST /api/inbox/items`

Persists a classified inbox item for the authenticated user. The local repository already uses the same request shape:

```json
{ "text": "купить молоко", "classification": { "status": "classified", "items": [] } }
```

When Supabase env and an authenticated user are present, the endpoint inserts into `inbox_items`, then fans out records into tasks, goals, habits, notes, events, or memories. Without Supabase env it returns `202` local-mode metadata so the browser can continue local persistence.


## Server Dashboard Load

When Supabase env and a session cookie are present, `/` loads inbox, tasks, goals, habits, events, memories, profile locale, and settings server-side through RLS-scoped Supabase queries. Anonymous users stay in local MVP mode.


## `PUT /api/settings` and `PUT /api/onboarding`

Both endpoints validate the shared schemas, return `202` local-mode metadata without Supabase env, and require a Supabase session when configured. Settings update `profiles.locale` plus `settings`; onboarding inserts a versioned answer, updates AI tone, and records balance scores.

## Expanded health response
`GET /api/health` returns app status plus Supabase and AI provider configuration flags without exposing secrets.

## Retry endpoint
`POST /api/inbox/retry` processes pending/failed inbox items when `AI_PROVIDER_API_KEY` or `OPENAI_API_KEY` is configured. Set `CRON_SECRET` and send `Authorization: Bearer <secret>` for scheduled production calls.

## Locale-aware classification
`POST /api/inbox/classify` accepts `locale` from the client. If omitted in Supabase mode, it resolves the authenticated user profile locale before building the AI provider prompt.

## API Guards
`/api/inbox/classify` and `/api/inbox/items` enforce JSON payload limits and per-route rate limits. `/api/inbox/retry` is rate-limited and validates `CRON_SECRET` with timing-safe comparison when configured.
