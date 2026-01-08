# SafariPlus Git Workflow

## Document Information
- **Version**: 1.0
- **Last Updated**: January 2026
- **Status**: Active
- **Owner**: Engineering Team

---

## Overview

This document defines the Git workflow, branching strategy, and collaboration standards for the SafariPlus development team. Following these guidelines ensures consistent, high-quality code delivery and smooth team collaboration.

---

## Branch Strategy (GitHub Flow)

SafariPlus uses a simplified GitHub Flow branching model optimized for continuous deployment.

### Branch Hierarchy

```
main (production)
  |
  +-- feature/SP-123-add-login
  |
  +-- feature/SP-124-tour-search
  |
  +-- bugfix/SP-125-fix-payment
  |
  +-- hotfix/SP-126-critical-fix
```

### Branch Types

| Branch Type | Purpose | Base Branch | Merge Target |
|-------------|---------|-------------|--------------|
| `main` | Production-ready code | - | - |
| `feature/*` | New features | `main` | `main` |
| `bugfix/*` | Non-critical bug fixes | `main` | `main` |
| `hotfix/*` | Critical production fixes | `main` | `main` |

### Branch Rules

#### Main Branch (`main`)
- Always deployable to production
- Protected: No direct pushes
- Requires PR with at least 1 approval
- All CI checks must pass
- Squash merge only

---

## Branch Naming Convention

### Format

```
{type}/SP-{ticket}-{short-description}
```

### Types

| Type | Usage |
|------|-------|
| `feature` | New functionality |
| `bugfix` | Bug fixes (non-critical) |
| `hotfix` | Critical production fixes |
| `docs` | Documentation only changes |
| `refactor` | Code refactoring (no feature change) |
| `test` | Adding or updating tests |
| `chore` | Build, CI, dependency updates |

### Examples

```bash
# Features
feature/SP-123-add-google-oauth
feature/SP-124-tour-search-filters
feature/SP-125-pesapal-integration
feature/SP-126-booking-calendar

# Bug fixes
bugfix/SP-130-fix-date-picker-timezone
bugfix/SP-131-correct-price-calculation

# Hotfixes
hotfix/SP-140-payment-webhook-timeout
hotfix/SP-141-fix-auth-redirect-loop

# Other
docs/SP-150-update-api-documentation
refactor/SP-151-extract-payment-service
test/SP-152-add-booking-unit-tests
chore/SP-153-upgrade-next-to-15
```

### Naming Rules

1. Use lowercase letters only
2. Separate words with hyphens (`-`)
3. Keep descriptions short (3-5 words max)
4. Always include ticket number
5. Be descriptive but concise

---

## Commit Message Format

### Structure

```
type(scope): description

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature for the user |
| `fix` | Bug fix for the user |
| `docs` | Documentation changes |
| `style` | Formatting, missing semicolons, etc. (no code change) |
| `refactor` | Code restructuring without feature change |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, CI changes |
| `perf` | Performance improvements |
| `ci` | CI/CD configuration changes |
| `revert` | Reverting a previous commit |

### Scopes (Optional)

| Scope | Description |
|-------|-------------|
| `auth` | Authentication & authorization |
| `booking` | Booking system |
| `payment` | Payment processing |
| `tour` | Tour management |
| `user` | User management |
| `search` | Search functionality |
| `admin` | Admin panel |
| `api` | API endpoints |
| `ui` | UI components |
| `db` | Database changes |

### Rules

1. **Subject line**:
   - Use imperative mood ("add" not "added" or "adds")
   - No period at the end
   - Maximum 72 characters
   - Capitalize first letter after colon

2. **Body** (optional):
   - Explain the "why" not the "what"
   - Wrap at 72 characters
   - Separate from subject with blank line

3. **Footer** (optional):
   - Reference issues: `Closes SP-123`
   - Breaking changes: `BREAKING CHANGE: description`

### Examples

#### Simple Feature
```
feat(auth): add Google OAuth login
```

#### Bug Fix with Body
```
fix(payment): handle Pesapal webhook timeout

The webhook was timing out after 10 seconds due to slow database
queries. Optimized the query and added async processing for
non-critical operations.

Closes SP-125
```

#### Breaking Change
```
feat(api): change booking response format

The booking API now returns dates in ISO 8601 format instead of
Unix timestamps for better client compatibility.

BREAKING CHANGE: Booking dates are now ISO 8601 strings instead of
Unix timestamps. Update client date parsing accordingly.

Closes SP-200
```

#### Documentation
```
docs(readme): update setup instructions
```

#### Refactoring
```
refactor(booking): extract price calculation to service

Moved price calculation logic from BookingController to
PriceCalculationService for better testability and reuse.
```

#### Chore
```
chore(deps): upgrade Next.js to 15.0.4

- Updated next from 14.2.0 to 15.0.4
- Updated related dependencies
- Fixed breaking changes in middleware
```

---

## Pull Request Process

### Workflow

```
1. Create Branch     2. Make Changes     3. Push & Create PR
       |                    |                    |
       v                    v                    v
   main --> feature/...   commit(s)        Open PR on GitHub
                                                 |
                                                 v
4. Code Review    5. Address Feedback    6. Merge
       |                    |                 |
       v                    v                 v
   Review PR          Push fixes       Squash & Merge
```

### Step-by-Step

#### 1. Create Feature Branch

```bash
# Ensure main is up to date
git checkout main
git pull origin main

# Create and checkout feature branch
git checkout -b feature/SP-123-add-login
```

#### 2. Make Changes with Atomic Commits

```bash
# Stage specific files
git add src/components/LoginForm.tsx

# Commit with proper message
git commit -m "feat(auth): add login form component"

# Continue with more atomic commits
git add src/lib/auth.ts
git commit -m "feat(auth): implement authentication logic"
```

#### 3. Push and Create PR

```bash
# Push branch to remote
git push -u origin feature/SP-123-add-login

# Create PR via GitHub CLI or web interface
gh pr create --title "feat(auth): add user login" --body "..."
```

#### 4. Fill PR Template

See PR Template section below.

#### 5. Request Review

- Assign at least one reviewer
- Add appropriate labels
- Link related issues

#### 6. Address Feedback

```bash
# Make requested changes
git add .
git commit -m "fix(auth): address review feedback"
git push
```

#### 7. Merge

- Ensure all checks pass
- Get required approvals
- Use "Squash and merge"
- Delete feature branch after merge

---

## PR Template

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Description

Brief description of changes and motivation.

## Related Issue

Closes SP-XXX

## Type of Change

- [ ] New feature (non-breaking change adding functionality)
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Test update

## Changes Made

- Change 1
- Change 2
- Change 3

## Testing

### Automated Tests

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] All existing tests pass

### Manual Testing

- [ ] Tested locally
- [ ] Tested on staging (if applicable)

#### Test Steps

1. Step 1
2. Step 2
3. Expected result

## Screenshots (if UI changes)

| Before | After |
|--------|-------|
| screenshot | screenshot |

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-reviewed my code
- [ ] Commented complex code sections
- [ ] Updated documentation (if needed)
- [ ] No console.logs or debug code
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Tested on mobile viewport (if UI)
- [ ] Accessibility checked (if UI)

## Deployment Notes

Any special deployment considerations or migrations needed.

## Additional Notes

Any other context or information reviewers should know.
```

---

## Code Review Guidelines

### For Authors

1. **Self-review first**
   - Read through your own PR before requesting review
   - Check for console.logs, debug code, commented code
   - Ensure tests pass locally

2. **Keep PRs small**
   - Aim for < 400 lines changed
   - Split large features into smaller PRs
   - One logical change per PR

3. **Provide context**
   - Fill PR template completely
   - Explain the "why" not just the "what"
   - Include screenshots for UI changes

4. **Respond promptly**
   - Address feedback within 24 hours
   - Explain if you disagree with a suggestion
   - Mark conversations as resolved

### For Reviewers

1. **Review within 24 hours**
   - Prioritize unblocking teammates
   - If busy, communicate delay

2. **Be constructive**
   - Explain why, not just what
   - Suggest solutions, not just problems
   - Distinguish between required and optional changes

3. **Check for security issues**
   - Input validation
   - SQL injection risks
   - Authentication/authorization
   - Sensitive data exposure

4. **Verify TypeScript types**
   - No `any` types without justification
   - Proper interface definitions
   - Generic constraints where needed

5. **Test locally if unsure**
   - Checkout the branch
   - Run the code
   - Verify functionality

### Review Comments

Use prefixes to indicate severity:

| Prefix | Meaning |
|--------|---------|
| `[BLOCKER]` | Must be fixed before merge |
| `[MAJOR]` | Should be fixed, can discuss |
| `[MINOR]` | Nice to have, optional |
| `[NIT]` | Nitpick, purely stylistic |
| `[QUESTION]` | Asking for clarification |
| `[SUGGESTION]` | Alternative approach |
| `[PRAISE]` | Positive feedback |

Examples:

```
[BLOCKER] This user input is not validated before being used in the query.
Please add Zod validation here.

[MINOR] Consider extracting this logic into a separate function for
better readability.

[NIT] Extra whitespace on line 45.

[PRAISE] Great job handling the edge case here!
```

---

## Release Process

### Version Numbering

Follow [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH

1.0.0 - Initial release
1.1.0 - New feature (backwards compatible)
1.1.1 - Bug fix
2.0.0 - Breaking change
```

### Release Workflow

```
1. Feature Freeze
       |
       v
2. Create Release Branch (optional for major releases)
       |
       v
3. Final Testing on Staging
       |
       v
4. Create Release Tag
       |
       v
5. Deploy to Production
       |
       v
6. Verify & Monitor
```

### Steps

#### 1. Feature Freeze

- Stop merging new features
- Only bug fixes and release prep allowed

#### 2. Final Testing

```bash
# Deploy to staging
git checkout main
git pull origin main

# Deploy to staging environment (automated via CI)
# QA team verifies all features
```

#### 3. Create Release Tag

```bash
# Create annotated tag
git tag -a v1.2.0 -m "Release v1.2.0

Features:
- Tour search with filters (SP-100)
- Google OAuth integration (SP-101)
- Booking calendar view (SP-102)

Bug Fixes:
- Fixed date picker timezone issue (SP-110)
- Corrected price calculation (SP-111)

See CHANGELOG.md for full details."

# Push tag
git push origin v1.2.0
```

#### 4. Deploy to Production

- Tag push triggers production deployment via CI/CD
- Monitor deployment logs
- Verify health checks

#### 5. Create GitHub Release

```bash
# Via GitHub CLI
gh release create v1.2.0 \
  --title "v1.2.0" \
  --notes "See CHANGELOG.md for release notes"
```

---

## Hotfix Process

For critical production issues that cannot wait for the normal release cycle.

### Workflow

```
1. Create Hotfix Branch     2. Fix & Test     3. PR & Review
         |                        |                  |
         v                        v                  v
   main --> hotfix/...       Quick fix         Fast review
                                                    |
                                                    v
                              4. Merge     5. Deploy Immediately
                                   |              |
                                   v              v
                            Squash merge    Production deploy
```

### Steps

#### 1. Create Hotfix Branch

```bash
git checkout main
git pull origin main
git checkout -b hotfix/SP-999-critical-payment-fix
```

#### 2. Implement Fix

```bash
# Make minimal, focused changes
git add .
git commit -m "fix(payment): resolve webhook signature verification

The signature was being compared before URL decoding, causing
all webhooks to fail validation.

Closes SP-999"
```

#### 3. Create PR

```bash
git push -u origin hotfix/SP-999-critical-payment-fix

gh pr create \
  --title "[HOTFIX] fix(payment): resolve webhook signature verification" \
  --body "CRITICAL: Payment webhooks are failing in production..." \
  --label "hotfix,critical"
```

#### 4. Fast Review

- Minimum 1 reviewer
- Focus on correctness and safety
- Skip non-critical feedback for speed

#### 5. Merge and Deploy

```bash
# After approval, merge immediately
gh pr merge --squash

# Tag hotfix release
git checkout main
git pull origin main
git tag -a v1.2.1 -m "Hotfix: Payment webhook signature verification"
git push origin v1.2.1
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3

  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
```

### Branch Protection Rules

Configure in GitHub repository settings:

```
Branch: main

Required:
- [ ] Require pull request before merging
  - [x] Require approvals: 1
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [x] Require review from Code Owners
- [x] Require status checks to pass before merging
  - [x] lint
  - [x] typecheck
  - [x] test
  - [x] build
- [x] Require branches to be up to date before merging
- [x] Require conversation resolution before merging
- [x] Do not allow bypassing the above settings
```

---

## Git Configuration

### Recommended `.gitconfig`

```ini
[user]
    name = Your Name
    email = your.email@safariplus.co.ke

[core]
    autocrlf = input
    editor = code --wait

[pull]
    rebase = true

[push]
    default = current
    autoSetupRemote = true

[fetch]
    prune = true

[alias]
    co = checkout
    br = branch
    ci = commit
    st = status
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = !gitk
    lg = log --oneline --graph --decorate
    cleanup = "!git branch --merged | grep -v '\\*\\|main' | xargs -n 1 git branch -d"
```

### Useful Git Commands

```bash
# View branch history
git log --oneline --graph --decorate --all

# Interactive rebase (for cleaning up commits before PR)
git rebase -i HEAD~3

# Amend last commit (before pushing)
git commit --amend

# Stash changes
git stash
git stash pop

# Cherry-pick a commit
git cherry-pick <commit-hash>

# Reset to remote state
git fetch origin
git reset --hard origin/main

# Clean up local branches
git branch --merged | grep -v '\*\|main' | xargs -n 1 git branch -d

# Find commits by message
git log --grep="SP-123"

# View changes between branches
git diff main...feature/SP-123

# Blame a file
git blame src/components/LoginForm.tsx
```

---

## Troubleshooting

### Common Issues

#### Merge Conflicts

```bash
# Update your branch with latest main
git checkout feature/SP-123
git fetch origin
git rebase origin/main

# Resolve conflicts, then continue
git add .
git rebase --continue
```

#### Accidentally Committed to Main

```bash
# If not pushed yet
git reset HEAD~1

# Create proper branch
git checkout -b feature/SP-123
git add .
git commit -m "feat: your message"
```

#### Need to Update PR Branch

```bash
git checkout feature/SP-123
git fetch origin
git rebase origin/main
git push --force-with-lease
```

#### Committed Sensitive Data

```bash
# Remove file from history (requires force push)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/sensitive/file" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (coordinate with team!)
git push --force --all

# Rotate any exposed credentials immediately!
```

---

## Summary

### Quick Reference

| Action | Command |
|--------|---------|
| Create feature branch | `git checkout -b feature/SP-XXX-description` |
| Commit changes | `git commit -m "type(scope): description"` |
| Push branch | `git push -u origin feature/SP-XXX-description` |
| Create PR | `gh pr create` |
| Update from main | `git fetch origin && git rebase origin/main` |
| Merge PR | Use GitHub "Squash and merge" |

### Branch Naming

```
feature/SP-{ticket}-{description}
bugfix/SP-{ticket}-{description}
hotfix/SP-{ticket}-{description}
```

### Commit Format

```
type(scope): description
```

### PR Checklist

- [ ] Branch follows naming convention
- [ ] Commits follow message format
- [ ] PR template filled out
- [ ] Tests pass
- [ ] Code reviewed
- [ ] No TypeScript errors
- [ ] Ready for squash merge

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2026 | Engineering Team | Initial document |
