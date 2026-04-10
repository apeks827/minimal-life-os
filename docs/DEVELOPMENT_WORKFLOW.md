# Minimal Life OS Development Workflow

This repository enforces a GitHub-first delivery process. All engineering work must leave visible Git history and, where appropriate, branch/PR evidence that the user can inspect externally.

## Repository State

- **Remote:** `origin` → `https://github.com/apeks827/minimal-life-os.git`
- **Default branch:** `main`
- **Visibility:** Public
- **Push access:** Requires `GH_TOKEN` exported in the active shell for push/PR operations

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

The environment does **not** have a configured `git credential.helper`, so standard HTTPS push will fail with a username prompt. The primary auth mechanism is `GH_TOKEN` used with the `gh` CLI and `git` push.

### Primary Auth Path (GH_TOKEN)

The `GH_TOKEN` environment variable must be set with a valid GitHub personal access token (`repo` scope). It is used for:

- `gh` CLI operations (authenticated as `apeks827`)
- `git push` operations (via credential helper)

Usage:

```bash
# Verify gh auth
gh auth status -h github.com

# Push branches
git push -u origin <branch>

# Create PRs
gh pr create --title "..." --body "..."
```

### Optional: Configure Credential Helper

If `GH_TOKEN` is present but `git push` still prompts for credentials, configure the credential helper:

```bash
git config credential.helper '!f() { echo "username=apeks827"; echo "password=$GH_TOKEN"; }; f'
```

This is optional — the environment already uses `GH_TOKEN` for `gh` CLI and push.

### Token Safety Rules

- **Never** hardcode the token in scripts, logs, or committed files
- **Never** log or print `GH_TOKEN` or its value
- Always pass via environment; do not interpolate into command strings

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

1. Verify `GH_TOKEN` is set and valid:
   ```bash
   gh auth status -h github.com
   ```
2. If invalid or missing, do not proceed — **escalate to CTO** for token refresh. This is outside DevEx control.

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
- [x] Push branches and open PRs (via `GH_TOKEN` + `gh`)
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

# Verify gh auth
gh auth status -h github.com

# View repo metadata
gh repo view apeks827/minimal-life-os --json defaultBranchRef,visibility
```
