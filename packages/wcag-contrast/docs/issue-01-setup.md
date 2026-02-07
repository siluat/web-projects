# Issue 1: Project Setup and Type Definitions

## Scope

- `package.json`, `tsconfig.json`, `vitest.config.ts`
- `src/types.ts`, `src/index.ts` (type re-export)

## Details

### package.json

- Package name: `@siluat/wcag-contrast`
- Zero runtime dependencies
- devDependencies: vitest, typescript, etc. (follow existing workspace patterns)
- exports: `./src/index.ts` (direct source reference pattern)

### tsconfig.json

- Extends `@siluat/typescript-config` base configuration

### vitest.config.ts

- Same configuration as existing workspace patterns

### src/types.ts

```typescript
export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a?: number; // 0-1
}

export type ComplianceLevel = 'AAA' | 'AA' | 'Fail';
export type TextSize = 'normal' | 'large';

export interface ContrastResult {
  ratio: number;
  normalText: { aa: boolean; aaa: boolean };
  largeText: { aa: boolean; aaa: boolean };
}
```

### src/index.ts

- Re-export public types from `types.ts`

## Estimated Size

~120 lines

## Verification

```bash
turbo run check-types --filter=@siluat/wcag-contrast
biome check packages/wcag-contrast
```
