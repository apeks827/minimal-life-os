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


## Planned `POST /api/inbox/items`

Persists a classified inbox item for the authenticated user. The local repository already uses the same request shape:

```json
{ "text": "купить молоко", "classification": { "status": "classified", "items": [] } }
```

The endpoint should insert into `inbox_items`, then fan out records into tasks, goals, habits, notes, events, or memories inside one transaction.
