# Minimal Life OS

Minimalist life-management product. Focus: simple daily capture, prioritization, and execution with pragmatic minimal UX.

## Project Layout

```
minimal-life-os/
├── opti/                      # Backend API (FastAPI + Python)
│   ├── app/                  # FastAPI application
│   ├── tests/                # Backend tests
│   ├── pyproject.toml        # Python dependencies
│   └── README.md             # Backend API documentation
├── docs/
│   └── DEVELOPMENT_WORKFLOW.md # GitHub-first delivery guidance
└── src/                      # Frontend (Vue 3 + TypeScript + Vite)
```

This README is the canonical source-of-truth for the Minimal Life OS project. For delivery workflow and engineering conventions, see `docs/DEVELOPMENT_WORKFLOW.md`.

## Stack

- **Frontend:** Vue 3 + TypeScript + Vite
- **Testing:** Vitest (frontend), pytest (backend)
- **Backend:** FastAPI + Uvicorn
- **Persistence:** JSON file (`data/task_state.json`)

## Run Locally

### Backend

```bash
cd opti
pip install -e .
uvicorn app.main:app --reload
```

Health check:

```bash
curl http://localhost:8000/health
```

### Frontend

```bash
npm install
cp .env.example .env.local
npm run dev
```

The Vite dev server runs on port `4173`.

## Validation Commands

```bash
# Backend
cd opti && pip install -e .
pytest tests/ -v

# Frontend
npm run lint
npm run type-check
npm run test -- --run
npm run build

# Full frontend gate
npm run validate
```

## Port Policy

| Service      | Port | Source              |
|-------------|------|---------------------|
| Frontend dev | 4173 | `vite.config.ts`    |
| Backend API  | 8000 | uvicorn default     |
| AI proxy    | 4174 | `.env.example`      |

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
