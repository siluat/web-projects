# 006: Build Tool — tsdown

## Status

Accepted

## Context

Publishing to npm requires a build tool to compile TypeScript source into JavaScript. Three candidates were evaluated: tsc, tsup, and tsdown.

Package characteristics:

- Zero external dependencies
- ESM-only (`"type": "module"`)
- Small codebase
- Requires `.d.ts` generation
- Includes a CLI entry point (shebang must be preserved)

## Decision

**Use tsdown as the build tool.**

### Rationale

1. **Extensionless imports in source:** tsc does not rewrite import specifiers, forcing `.js` extensions in TypeScript source files for Node.js ESM compatibility. tsdown bundles modules, eliminating this issue entirely and keeping source imports clean.
2. **ESM-first defaults:** tsdown defaults to ESM output format, requiring no additional configuration for ESM-only packages.
3. **Bundled DTS:** All types are bundled into a single `.d.ts` file, giving consumers a clean type definition.
4. **Automatic shebang handling:** tsdown preserves `#!/usr/bin/env node` in CLI entry points and grants execute permissions automatically.
5. **Active maintenance:** Maintained by VoidZero (the Vite/Rolldown ecosystem). The original tsup author directs users to tsdown as its official successor.

### Rejected Alternatives

**tsc** — By design, tsc does not rewrite import paths, requiring `.js` extensions in source files. This degrades developer experience. A separate `tsconfig.build.json` is also needed to split IDE/type-checking concerns from build output.

**tsup** — Functionally sufficient, but its maintainer (EGOIST) has declared the project no longer actively maintained and recommends migrating to tsdown. Adopting tsup for a new project would mean starting with a deprecated tool.

## References

- `packages/color-contrast/tsdown.config.ts` — Build configuration
- `packages/color-contrast/package.json` — `build` script
- [tsdown documentation](https://tsdown.dev)
- [tsup README: migration notice to tsdown](https://github.com/egoist/tsup)
