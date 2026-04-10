# Minimal Life OS Development Workflow

This repository enforces a GitHub-first delivery process. All engineering work must leave visible Git history and, where appropriate, branch/PR evidence that the user can inspect externally.

## Repository State

- **Remote:** `origin` → `https://github.com/apeks827/minimal-life-os.git`
- **Default branch:** `main`
- **Visibility:** Public
- **Push/PR access:** Requires `GH_CONFIG_DIR="$HOME/.config/gh"` set in the active shell before `gh` or `git push`. Auth is stored in `~/.config/gh/hosts.yml`. The `GH_TOKEN` variable is not currently set — do not depend on it.

## Git Configuration

The workspace has a local git user configured:

```
git config user.name "Personal OS Bot"
git config user.email "bot@example.com"
```

Agents must include the Paperclip co-author line on every commit:

```
Co-Authored-By: Paperclip <noreply@paperclip.ing>
```

## Branch/Commit/PR Expectations

### For Small, Low-Risk Changes

Direct commits to `main` are acceptable when the change matches one of these allowlisted categories:

1. **Typos or wording fixes** (documentation, comments)
2. **Whitespace or formatting-only changes** (no logic)
3. **Documentation-only changes** under 100 lines with no code impact

If the change does not match one of these categories, use the feature branch workflow below.

**Process:**

```bash
git add -A
git commit -m "<description>

Co-Authored-By: Paperclip <noreply@paperclip.ing>"
git push origin main
```

Note: `git push` requires `GH_TOKEN` in the environment. See Authentication section.

### For Feature Work or Nontrivial Changes

Create a feature branch and open a pull request:

```bash
git checkout -b feature/<short-description>
# make changes
git add -A
git commit -m "<description>

Co-Authored-By: Paperclip <noreply@paperclip.ing>"
git push -u origin feature/<short-description>
gh pr create --title "<title>" --body "<description>"
```

**PR conventions:**

- Branch naming: `feature/<short-description>` or `fix/<issue-ref>`
- PR title: imperative mood, concise
- PR body: link to relevant issue(s), describe what changed and why
- Merge strategy: squash and merge for clean history, unless a linear history is explicitly desired
- Merge ownership: agents should not merge their own PRs without explicit approval from a reviewer or operator

### For Work Tied to a Task

Include the issue identifier in commit messages:

```
[AGE-219] Establish GitHub-visible delivery workflow

- Add DEVELOPMENT_WORKFLOW.md
- Document branch/commit/PR expectations
- Confirm push access via GH_TOKEN

Co-Authored-By: Paperclip <noreply@paperclip.ing>
```

## Authentication

The `gh` CLI and `git push` authenticate via a stored token in `~/.config/gh/hosts.yml`. The Paperclip adapter overrides `XDG_CONFIG_HOME` to a temp directory at startup, which breaks `gh` credential lookup. A single environment override restores auth.

### Auth Override (Required in This Workspace)

Before any `gh` or `git push` command, set:

```bash
export GH_CONFIG_DIR="$HOME/.config/gh"
```

This points `gh` to the correct config file containing the `apeks827` token. Without this, `gh` and `git push` will report unauthenticated.

Usage after the override:

```bash
export GH_CONFIG_DIR="$HOME/.config/gh"

# Verify gh auth
gh auth status -h github.com

# Push branches
git push -u origin <branch>

# Create PRs
gh pr create --title "..." --body "..."
```

### Token Safety Rules

- **Never** hardcode the token in scripts, logs, or committed files
- **Never** log or print the token value
- Do not pass token via `GH_TOKEN` env var — use the `GH_CONFIG_DIR` override instead

## Failure Modes and Recovery

### Push Rejected (Remote Ahead)

If `git push` is rejected because the remote is ahead:

1. Fetch and rebase:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
2. Resolve conflicts if any, then:
   ```bash
   git rebase --continue
   git push origin <branch>
   ```

### Authentication Failure

If push or `gh` CLI fails with authentication errors:

1. Ensure `gh` is pointed at the persisted auth file:
```bash
export GH_CONFIG_DIR="$HOME/.config/gh"
gh auth status -h github.com
```
2. If the output still says "not logged into any GitHub hosts", confirm `~/.config/gh/hosts.yml` exists and is readable in this workspace.
3. If auth is still invalid or missing after confirming `GH_CONFIG_DIR` and `hosts.yml`, do not proceed — **escalate to CTO** for token refresh/rotation. This is outside DevEx control.

### Commit to `main` Mistake

If you committed directly to `main` and need to undo before push:

```bash
git reset --hard HEAD~1
```

If already pushed, do not force-push. Create a revert commit:

```bash
git revert HEAD
git push origin main
```

### PR Not Mergeable

If a PR has conflicts:

1. Rebase onto target branch:
   ```bash
   git checkout feature/<branch>
   git fetch origin
   git rebase origin/main
   ```
2. Force-push to update the PR:
   ```bash
   git push --force-with-lease origin feature/<branch>
   ```

## CI/CD

No CI/CD pipeline is defined yet. When adding one:

- Prefer GitHub Actions for visibility
- Keep workflows in `.github/workflows/`
- Document required secrets and environment variables in this file

## What Can Be Done Now

- [x] Clone/fetch from the public repo
- [x] Create branches locally
- [x] Push branches and open PRs (via `GH_CONFIG_DIR` + `gh`)
- [x] Merge PRs via GitHub UI or `gh pr merge`

## What Needs Human Setup

- [ ] Configure branch protection rules (if desired)
- [ ] Add CI/CD workflows
- [ ] Define code review policy (required reviewers, auto-merge rules)
- [ ] Set up issue/PR templates in `.github/`

## Agent Workflow Summary

1. **Start work:** `git checkout main && git pull origin main`
2. **Branch if needed:** `git checkout -b feature/<name>`
3. **Make changes and commit:**
   ```
   git commit -m "<message>

   Co-Authored-By: Paperclip <noreply@paperclip.ing>"
   ```
4. **Push:** `git push -u origin <branch>`
5. **Open PR (if applicable):** `gh pr create --title "..." --body "..."`
6. **Update task:** comment with commit SHA and PR URL

## Validation Commands

```bash
# Verify repo state
git remote -v
git status -sb

# Verify gh auth (requires GH_CONFIG_DIR in this workspace)
export GH_CONFIG_DIR="$HOME/.config/gh"
gh auth status -h github.com

# View repo metadata
export GH_CONFIG_DIR="$HOME/.config/gh"
gh repo view apeks827/minimal-life-os --json defaultBranchRef,visibility
```
