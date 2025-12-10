# Suggest Commit Message

Below is an instruction for suggesting commit messages for the currently staged changes.  
**Do not actually perform the commit, only suggest commit messages in English for my review.**

---

## Process

1. First, check the staged changes using `git diff --staged`
2. Analyze the changes and their context
3. Suggest commit messages following the guidelines below

## Guidelines

### Format

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Type

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, white-space, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Build system or dependency changes
- **ci**: CI configuration changes
- **chore**: Other changes that don't modify src or test files

### Scope

- Optional, use when it adds meaningful context
- Use package name for package-specific changes
- Use 'repo' for monorepo management changes (e.g., turbo.json, root package.json)
- Format: `feat(parser):`, `fix(auth):`

### Description

- Use imperative mood (e.g., "add button", "fix typo", "refactor layout")
- Write in English
- Keep within 50 characters if possible, maximum 72 characters
- No period at the end

### Breaking Changes

- Add `!` after type/scope: `feat!: ...` or `feat(api)!: ...`
- Or add `BREAKING CHANGE:` footer

### Body

- Optional, separated from description by a blank line
- Provide additional context for complex changes

### Footer

- Optional, separated from body by a blank line
- Format: `BREAKING CHANGE: <description>`, `Refs: #123`, `Reviewed-by: Name`

## Output Format

Provide 2-3 commit message options:

1. **Concise version** (≤50 chars): For simple, clear changes
2. **Descriptive version** (≤72 chars): When more context is helpful
3. **With body** (optional): For complex changes that need explanation

## Examples

### Simple change

- Concise: `feat(ui): add user profile page`
- Descriptive: `feat(ui): add user profile page with avatar and settings`

### Complex change

- Concise: `refactor(auth): extract login logic into separate module`
- Descriptive: `refactor(auth): extract login logic into separate module for reusability`
- With body:

```text
refactor(auth): extract login logic into separate module

Move authentication logic from App component to auth module
Create reusable login function
Improves code organization and testability
```

### Breaking change

- With `!`: `feat(api)!: remove deprecated getUserById method`
- With footer:

```text
feat(api): migrate to new user service

BREAKING CHANGE: getUserById method has been removed. Use getUser(id) instead.
```

### Monorepo management change

- Concise: `chore(repo): configure turbo.json for build pipeline`
- Descriptive: `chore(repo): configure turbo.json with build and test tasks`

**Output the commit message options in English. Do NOT run the commit command!**
