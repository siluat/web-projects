# Dependency Update Report (2026-03-31)

## 1. High Priority — Major Framework Upgrades

| Package | Current | Latest | Affected Workspaces |
|---------|---------|--------|---------------------|
| **astro** | 5.18.1 | **6.1.2** | dotori-note |
| **@astrojs/mdx** | 4.3.14 | **5.0.3** | dotori-note |
| **@astrojs/react** | 4.4.2 | **5.0.2** | dotori-note |
| **next** | 15.5.14 | **16.2.1** | ui-craft-playground, animation-practice |

- Astro 6 and Next.js 16 are major versions likely containing security patches and performance improvements.
- Astro plugins (@astrojs/mdx, @astrojs/react) must be upgraded together with Astro 6.

## 2. Medium Priority — Widely Shared Dependencies

| Package | Current | Latest | Affected Workspaces |
|---------|---------|--------|---------------------|
| **TypeScript** | 5.9.3 | **6.0.2** | color-contrast-docs, ui-craft, shadcn-ui, color-contrast, color-contrast-cli, noumenon-librarian, ui-craft-playground |
| **lucide-react** (catalog) | 0.525.0 | **1.7.0** | dotori-note, shadcn-ui, ui-craft-playground, animation-practice |
| **@types/node** | 24.12.0 | **25.5.0** | dotori-note, shadcn-ui, ui-craft-playground |

- TypeScript 6 spans **7 workspaces**, making it the widest-reaching update.
- lucide-react is managed via **catalog**, so a single change propagates to 4 workspaces.

## 3. Medium Priority — Effect Ecosystem

| Package | Current | Latest | Affected Workspaces |
|---------|---------|--------|---------------------|
| **@effect/experimental** | 0.52.2 | **0.60.0** | noumenon-librarian |
| **@effect/platform** | 0.88.2 | **0.96.0** | noumenon-librarian |
| **@effect/platform-node** | 0.91.0 | **0.106.0** | noumenon-librarian |
| **@effect/sql** | 0.42.1 | **0.51.0** | noumenon-librarian |

- All are 0.x versions, so even minor bumps may contain breaking changes.
- All 4 packages should be updated **together** to ensure compatibility.

## 4. Low Priority — Build & Dev Tools

| Package | Current | Latest | Affected Workspaces |
|---------|---------|--------|---------------------|
| **@biomejs/biome** | 2.3.8 | **2.4.10** | root (all) |
| **turbo** | 2.8.21 | **2.9.1** | root (all) |
| **@turbo/gen** | 2.8.21 | **2.9.1** | root, shadcn-ui |
| **tsdown** | 0.20.3 | **0.21.7** | color-contrast, color-contrast-cli |

- Minor version updates with relatively low risk.
- Build/lint tools have minimal production impact.

## Recommended Update Order

1. **Build tools** (biome, turbo, tsdown) — Low risk, improves overall dev environment.
2. **TypeScript 6 + @types/node 25** — Wide shared scope, best addressed early.
3. **lucide-react 1.x** — Single catalog change propagates to all consumers.
4. **Effect packages (batch)** — Isolated to noumenon-librarian.
5. **Astro 6 + plugins** — Requires dotori-note migration.
6. **Next.js 16** — Playground-only, relatively low migration burden.
