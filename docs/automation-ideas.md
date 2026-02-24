# Automation Ideas: Agents, Skills, and Commands

> Created 2026-02-24. Ideas for improving monorepo automation.
> Focuses on gaps not already covered by Turborepo, Lefthook, GitHub Actions CI, or Turbo generators.

## Priority Overview

| Idea | Type | Priority | Status |
|---|---|---|---|
| Commit message skill | Skill/Command | High | Not implemented |
| Post-package-creation checklist | Hook/Guide | Medium | Not implemented |
| PR local validation + creation | Command | Medium | Not implemented |
| Dependency update review | Agent | Medium | Not implemented |
| Cursor rules to universal skills | Skill | Low | Not implemented |
| Package impact analysis | Agent | Low | Not implemented |
| Rust cross-build debugging | Agent | Low | Not implemented |

---

## Skills / Commands

### 1. Commit Message Skill (High)

- **Rationale:** `.cursor/commands/suggest-commit-message.md` exists for Cursor but is not available to other agents
- **Approach:** Conventional commit format with automatic scope detection based on changed files' workspace paths
- **Expected value:** Automates repetitive commit message writing on every commit
- **Reference:** `.cursor/commands/suggest-commit-message.md`

### 2. Post-Package-Creation Checklist (Medium)

- **Rationale:** `turbo gen package` handles scaffolding, but several manual steps remain afterward
- **Checklist items:**
  - Add Codecov flags (CI workflow `.github/workflows/ci.yml` + `codecov.yml`)
  - Configure `tsconfig.json` to reference `@siluat/typescript-config`
  - Verify required tasks in `turbo.json`
  - Review whether `biome.jsonc` exclusion patterns are needed
- **Approach:** Hook (detect package creation) or guide document

### 3. PR Local Validation + Creation Command (Medium)

- **Rationale:** Run the same validation as the CI pipeline (`static-check → build → test:coverage`) locally before pushing
- **Approach:** Local validation → commit → push → `gh pr create`
- **Note:** CI already catches issues, so this is "nice to have". Primary value is shortening the feedback loop

### 4. Cursor Rules to Universal Skills (Low)

- **Targets:**
  - `wcag-contrast-guidelines.mdc` → wcag-contrast development guide
  - `animations-guidelines.mdc` → animation guide
- **Rationale:** Apply consistent guidelines across any agent, not tied to a specific IDE
- **Note:** Already working in Cursor, so only valuable when other agents are actively used for these packages

---

## Agents

### 5. Dependency Update Review Agent (Medium)

- **Rationale:** Uses major versions like React 19, Next.js 15, TailwindCSS 4.0. Compatibility review is complex
- **Workflow:** `bun outdated` → analyze changes → summarize breaking changes → propose update plan
- **Frequency:** Periodic (roughly once a month)

### 6. Package Impact Analysis Agent (Low)

- **Rationale:** Understand how changes to one package affect others in the monorepo
- **Workflow:** Trace workspace dependency graph based on changed files → list affected packages + suggest test scope
- **Note:** `turbo --filter` and `--affected` already handle build/test scoping. Limited additional value

### 7. Rust + Node.js Cross-Build Debugging Agent (Low)

- **Rationale:** Support debugging the multi-stage build of `noumenon-gleaner` (Cargo → postbuild script → binary copy)
- **Note:** Very low frequency. Ad-hoc support when needed is sufficient

---

## Existing Automation (Reference)

For avoiding duplication with new ideas.

- **Pre-commit hooks:** Lefthook + Biome (`lefthook.yml`)
- **CI/CD:** GitHub Actions — static-check, build, test:coverage, Codecov (`.github/workflows/ci.yml`)
- **Package scaffolding:** Turbo generators (`turbo/generators/config.ts`, `templates/`)
- **Task orchestration:** Turborepo dependency graph (`turbo.json`)
- **Code quality:** Biome formatting/linting (`biome.jsonc`)
- **AI Skills:** `.agents/skills/` directory (turborepo, vercel-react-best-practices)
- **MCP servers:** astro-docs (`.mcp.json`)
