# Codecov Maintenance Guide

## Overview

This project uses [Codecov](https://app.codecov.io) to track test coverage. The CI pipeline generates coverage reports and uploads them to Codecov, which then posts coverage change summaries as PR comments.

## Initial Setup

Steps required when connecting Codecov to this repository for the first time. Skip this section if the integration is already complete.

### 1. Register the Repository on Codecov

1. Sign in to [app.codecov.io](https://app.codecov.io) with your GitHub account.
2. In the dashboard, select the **"Not yet setup"** tab to see unregistered repositories.
3. Click the **"Configure"** button next to the target repository.
4. After configuration, a **CODECOV_TOKEN** is displayed. Copy this token.

> If the repository does not appear in the list, check the Codecov GitHub App permissions. Go to GitHub Settings > Integrations > Codecov and grant access to the repository.

### 2. Add the Secret to GitHub

1. Go to the repository on GitHub: **Settings** > **Secrets and variables** > **Actions**.
2. Click **"New repository secret"**.
3. Enter `CODECOV_TOKEN` as the name and paste the copied token as the value.

### 3. Verify the Integration

1. Create a PR that includes coverage — the CI will run the Codecov upload step.
2. On successful upload, the Codecov bot posts a coverage report comment on the PR.
3. Visit the [Codecov dashboard](https://app.codecov.io) and select the repository to view coverage trends.

## Adding Coverage to a New Package

### 1. Add a `test:coverage` Script to the Package

```json
{
  "scripts": {
    "test": "bun test",
    "test:coverage": "bun test --coverage --coverage-reporter=lcov"
  }
}
```

### 2. Add the Coverage File Path to the CI Workflow

In `.github/workflows/ci.yml`, append the new package's LCOV path to the `files` list in the Codecov upload step.

```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v5
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: packages/ui-craft/coverage/lcov.info,packages/wcag-contrast/coverage/lcov.info,packages/new-package/coverage/lcov.info
    fail_ci_if_error: false
```

## `codecov.yml` Configuration Options

Codecov behavior is configured via `codecov.yml` at the project root.

### Key Settings

| Setting | Description |
|---------|-------------|
| `coverage.status.project.default.target` | Overall coverage target. `auto` uses the base commit as baseline |
| `coverage.status.project.default.threshold` | Allowed deviation from target (e.g., `1%`) |
| `coverage.status.patch.default.target` | Coverage target for changed code (patch) |
| `comment.layout` | PR comment layout format |

### Per-Package Coverage with `flag_management`

As the number of packages grows, use `flag_management` to track coverage status independently per package.

```yaml
flag_management:
  individual_flags:
    - name: ui-craft
      paths:
        - packages/ui-craft/
      statuses:
        - type: project
          target: auto
    - name: wcag-contrast
      paths:
        - packages/wcag-contrast/
      statuses:
        - type: project
          target: auto
```

When using this configuration, the `flags` parameter must also be specified in the CI upload step.

## Checking Coverage Locally

```bash
# Run coverage for all packages
turbo run test:coverage

# Run coverage for a specific package
cd packages/wcag-contrast
bun test --coverage
```

The `--coverage` flag prints a text summary to the terminal. Adding `--coverage-reporter=lcov` also generates a `coverage/lcov.info` file.

## Related Files

| File | Description |
|------|-------------|
| `codecov.yml` | Codecov settings (coverage targets, PR comment layout) |
| `.github/workflows/ci.yml` | CI workflow (coverage execution and upload) |
| `packages/*/package.json` | `test:coverage` script in each package |
| `turbo.json` | `test:coverage` task definition |
