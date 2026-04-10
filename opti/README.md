# opti — v0.2 Durable Task Backend

Backend API for the Minimal Life OS durable task-state engine. Provides same-browser
task persistence across reload, tab close, and browser restart.

## Stack

- **Framework:** FastAPI 0.109+
- **Runtime:** Uvicorn
- **Persistence:** JSON file (`data/task_state.json`)
- **Python:** 3.11+

## API Surface

### `GET /api/v1/task-state`

Returns the current persisted task state. For a new session (no persisted state), returns the
default empty shape:

```json
{
  "inbox": [],
  "today": [],
  "later": [],
  "focus": null,
  "completed": [],
  "session_count": 0,
  "carry_forward_queue": []
}
```

### `PUT /api/v1/task-state`

Persists a full task state. Applies invariant enforcement on save.

### `GET /health`

Returns `{"status": "ok"}`.

## Invariants Enforced

| Rule | Enforcement |
|---|---|
| `today.length <= 3` | HTTP 422 if violated |
| `carryForwardQueue` must be `[]` | HTTP 422 if non-empty |
| `focus` is `null` or a valid `TaskItem` | Pydantic validation |

## Local Development

```bash
# Install dependencies
cd opti
pip install -e .

# Run the server
uvicorn app.main:app --reload

# Run tests
OPT_DATA_DIR=/tmp/opti-test pytest tests/
```

## Validation Commands

```bash
# 1. Install deps
cd opti && pip install -e .

# 2. Start server in background (port 8000)
uvicorn app.main:app --port 8000 &
sleep 2

# 3. GET new session — expect default empty shape
curl -s http://localhost:8000/api/v1/task-state | python -m json.tool

# 4. PUT state and reload — expect persistence
curl -s -X PUT http://localhost:8000/api/v1/task-state \
  -H "Content-Type: application/json" \
  -d '{"inbox":[{"id":"a","title":"Inbox A","completed":false}],"today":[{"id":"b","title":"Today B","completed":false}],"later":[],"focus":{"id":"b","title":"Today B","completed":false},"completed":[],"session_count":1,"carry_forward_queue":[]}' \
  | python -m json.tool

# 5. GET persisted state
curl -s http://localhost:8000/api/v1/task-state | python -m json.tool

# 6. Test today > 3 — expect 422
curl -s -X PUT http://localhost:8000/api/v1/task-state \
  -H "Content-Type: application/json" \
  -d '{"inbox":[],"today":[{"id":"1","title":"1","completed":false},{"id":"2","title":"2","completed":false},{"id":"3","title":"3","completed":false},{"id":"4","title":"4","completed":false}],"later":[],"focus":null,"completed":[],"session_count":0,"carry_forward_queue":[]}' \
  -w "\nHTTP_STATUS:%{http_code}\n"

# 7. Test carryForwardQueue non-empty — expect 422
curl -s -X PUT http://localhost:8000/api/v1/task-state \
  -H "Content-Type: application/json" \
  -d '{"inbox":[],"today":[],"later":[],"focus":null,"completed":[],"session_count":0,"carry_forward_queue":[{"id":"x","title":"Bad","completed":false}]}' \
  -w "\nHTTP_STATUS:%{http_code}\n"

# 8. Run unit tests
OPT_DATA_DIR=/tmp/opti-test pytest tests/ -v

# 9. Health check
curl -s http://localhost:8000/health | python -m json.tool
```

## Material Documentation Impact

No changes to `docs/DEVELOPMENT_WORKFLOW.md` or `opti/README.md` are required. This
implementation does not introduce new environment variables, migration steps, or operator
runbooks beyond what is listed above.
