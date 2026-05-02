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
