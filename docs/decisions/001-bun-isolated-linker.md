# 001: Switch bun linker to isolated mode

## Status

Accepted (2026-03-27)

## Context

This monorepo uses bun workspaces with the default `hoisted` linker. The hoisted linker places all resolved dependencies in a shared `node_modules/` at the workspace root, similar to npm.

While adding `color-contrast-docs` with Fumadocs (Next.js 16), installing `@types/react@19.2.14` (which depends on `csstype@3.2.3`) changed the hoisted `@types/react` for the entire workspace. This caused `ui-craft-playground` to fail type checks: Radix UI components expected `CSSProperties` from `csstype@3.1.3`, but TypeScript resolved it from the newly hoisted `csstype@3.2.3`. The two versions are structurally incompatible.

The root cause is that bun's hoisted linker allows one workspace package's dependency changes to affect another package's transitive resolution — a class of problems that will recur as the monorepo grows.

## Decision

Switch to bun's `isolated` linker by adding `bunfig.toml` at the workspace root:

```toml
[install]
linker = "isolated"
```

## Consequences

### How it works

The isolated linker (available since bun 1.2.19) provides pnpm-style strict dependency isolation:

- Each workspace package can only access its explicitly declared dependencies.
- Dependencies are stored in `node_modules/.bun/<package>@<version>/` and symlinked per-workspace.
- The lockfile (`bun.lock`) captures resolution; the linker controls the physical `node_modules` layout. Switching linkers does not change the lockfile.

### Benefits

- **No cross-workspace contamination.** Adding a dependency to one package cannot change another package's type resolution.
- **No phantom dependencies.** A package cannot accidentally import a dependency it does not declare, making dependency declarations explicit and correct.
- **Deterministic.** The same lockfile always produces the same per-package dependency tree regardless of install order.

### Trade-offs and caveats

- **`@types/*` hoisting.** In isolated mode, TypeScript needs `@types` packages to be discoverable. Bun hoists `@types*` to the root `node_modules/` by default via `publicHoistPattern`. A past bug (oven-sh/bun#25336) caused incorrect hoisting when multiple versions existed; this was fixed and is included in bun 1.3.x.
- **No selective `nohoist`.** Bun does not support excluding specific packages from hoisting (oven-sh/bun#6850). The `publicHoistPattern` and `hoistPattern` options are inclusive (you list what to hoist, not what to exclude).
- **`overrides`/`resolutions` remain flat-only.** Bun supports `overrides` and `resolutions` in `package.json` for forcing a transitive dependency version, but only at the top level — nested overrides like `"@types/react/csstype"` are not supported.
- **Tooling compatibility.** Some tools assume a flat `node_modules` layout. Next.js, Astro, Vitest, and Turborepo all work correctly with isolated installs as verified in this monorepo.

## Alternatives considered

| Alternative | Why not |
|---|---|
| `overrides` to pin `csstype` | Fixes one symptom but does not prevent the class of problems. New conflicts would require new overrides. |
| Align all `@types/react` versions | Requires all workspace packages to upgrade simultaneously. Fragile — any future `bun install` could re-introduce the mismatch. |
| Switch to pnpm | Achieves the same isolation but requires migrating the entire toolchain. Bun's isolated linker provides equivalent behavior without changing the package manager. |

## References

- [Bun isolated installs documentation](https://bun.sh/docs/install/lifecycle#isolated-installs)
- [oven-sh/bun#25336](https://github.com/oven-sh/bun/issues/25336) — `@types` hoisting fix in isolated mode
- [oven-sh/bun#6850](https://github.com/oven-sh/bun/issues/6850) — `nohoist` feature request
