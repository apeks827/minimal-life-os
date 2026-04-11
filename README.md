# Minimal Life OS

Minimalist life-management product. Focus: simple daily capture, prioritization, and execution with pragmatic minimal UX.

## Project Layout

```
minimal-life-os/
├── opti/ # Backend API (FastAPI + Python)
│   ├── app/ # FastAPI application
│   │   ├── static/ # Frontend static files
│   │   │   └── index.html # Single-page MVP shell
│   ├── tests/ # Backend tests
│   ├── .venv/ # Prebuilt virtual environment
│   ├── pyproject.toml # Python dependencies
│   └── README.md # Backend API documentation
└── docs/
    └── DEVELOPMENT_WORKFLOW.md # GitHub-first delivery guidance
```

This README is the canonical source-of-truth for the Minimal Life OS project. For delivery workflow and engineering conventions, see `docs/DEVELOPMENT_WORKFLOW.md`.

## Stack

- **Backend:** FastAPI + Uvicorn
- **Frontend:** Single-page HTML/JS (no build step)
- **Testing:** pytest
- **Persistence:** SQLite (`$OPT_DATA_DIR/task_state.db`)
- **Python:** 3.11+ (prebuilt venv at `opti/.venv`)

## Run Locally

### Backend + Frontend

```bash
cd opti
.venv/bin/uvicorn app.main:app --reload
```

Open http://localhost:8000 in browser.

Health check:

```bash
curl http://localhost:8000/health
```

## Validation Commands

```bash
# Backend tests (use prebuilt venv)
cd opti
.venv/bin/pytest tests/ -v

# Lint
.venv/bin/ruff check app/ tests/

# Type check (if mypy available)
.venv/bin/mypy app/
```

## Port Policy

| Service | Port | Source |
|------------|------|-----------------|
| Backend API | 8000 | uvicorn default |
| Frontend | 8000 | served by backend |

## GitHub-First Delivery

All engineering work must leave visible Git history. See `docs/DEVELOPMENT_WORKFLOW.md` for the full workflow.

### Quick Reference

Before any `gh` or `git push` operation, set the auth override:

```bash
export GH_CONFIG_DIR="$HOME/.config/gh"
```

Verify auth:

```bash
export GH_CONFIG_DIR="$HOME/.config/gh"
gh auth status -h github.com
```

Commit format:

```
[AGE-NNN] Short description

- bullet of what changed
- Co-Authored-By: Paperclip <noreply@paperclip.ing>
```

### Small Changes (allowlisted)

Direct commit to `main` is acceptable for:

1. Typos or wording fixes
2. Whitespace/formatting-only changes
3. Documentation-only changes under 100 lines

### Feature Work

```bash
git checkout -b feature/<short-description>
# make changes
git add -A
git commit -m "..."
git push -u origin feature/<short-description>
gh pr create --title "..." --body "..."
```

### Validation

```bash
export GH_CONFIG_DIR="$HOME/.config/gh"
gh auth status -h github.com
git remote -v
git status -sb
gh repo view apeks827/minimal-life-os --json defaultBranchRef,visibility
```

## Development Workflow

Stage-gated process for all changes:

1. **Requirements** — clarify scope, acceptance criteria, and dependencies
2. **Critic review** — Technical Critic approves sequencing before coding
3. **Implementation** — build with all validation gates passing
4. **Documentation handoff** — update canonical docs for material changes
5. **QA validation** — Senior QA verifies against actual commands
6. **CTO signoff** — closes after QA confirmation

## Material Documentation Impact

A change is material when it affects:
- validation commands or required delivery gates
- release steps, environment setup, or operator procedures
- troubleshooting or runbook behavior
- acceptance flow or canonical workflow expectations

A change is **not** material when it is only:
- typo cleanup
- minor wording polish without meaning change
- in-code comments with no source-of-truth impact

## What Needs Human Setup

- [ ] Configure branch protection rules
- [ ] Add CI/CD workflows
- [ ] Define code review policy (required reviewers, auto-merge rules)
- [ ] Set up issue/PR templates in `.github/`
