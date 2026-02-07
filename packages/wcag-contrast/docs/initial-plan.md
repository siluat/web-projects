# @siluat/wcag-contrast Design Plan

## Context

WCAG 2.1 color contrast ratio calculator utility and CLI package.

Constraints:
- Zero runtime dependencies (required)
- Prefer declarative patterns (preferred)
- Easy to follow flow at high abstraction level (preferred)

## Design Principles

### 1. Pure Pipeline

Every operation in this library is a side-effect-free unidirectional transformation. Input follows a single path to produce results, with no shared state or branching.

```text
Color String → RGB → Luminance → Ratio → Compliance
```

### 2. Data-Driven Format Support

Color format definitions are expressed as data structures, not control flow. To add a new format, add an entry to the table — no logic changes required.

### 3. Implementation Hiding

The public API deals only with strings and results. Intermediate representations (color spaces, coordinate systems) are never exposed beyond module boundaries.

### 4. Self-Containment

All color space conversions, parsing, and calculations are implemented internally. Zero runtime dependencies.

### 5. Module = Pipeline Stage

Each source file is responsible for exactly one stage of the pipeline. Opening a file immediately reveals its role in the pipeline.

The file structure serves as architectural documentation. A directory listing should make the entire pipeline structure readable, eliminating any guesswork about which file to open for a given stage.

## File Structure

```text
packages/wcag-contrast/src/
├── index.ts           # Public API
├── types.ts           # Public types
├── parse.ts           # String → RGB
├── named-colors.ts    # CSS named color data table
├── luminance.ts       # RGB → Relative luminance
├── contrast.ts        # Contrast ratio + WCAG compliance
└── cli.ts             # CLI entry point
```

## Declarative Design Details

### parse.ts — Format Table

```typescript
const COLOR_FORMATS: ColorFormat[] = [
  { pattern: /^#([0-9a-f]{3})$/i, toRgb: fromShortHex },
  { pattern: /^#([0-9a-f]{4})$/i, toRgb: fromShortHexAlpha },
  { pattern: /^#([0-9a-f]{6})$/i, toRgb: fromHex },
  { pattern: /^#([0-9a-f]{8})$/i, toRgb: fromHexAlpha },
  { pattern: /^rgba?\((.+)\)$/i, toRgb: fromRgbFunction },
  { pattern: /^hsla?\((.+)\)$/i, toRgb: fromHslFunction },
  { pattern: /^lch\((.+)\)$/i, toRgb: fromLchFunction },
  { pattern: /^oklch\((.+)\)$/i, toRgb: fromOklchFunction },
];

export function parseColor(input: string): RGB {
  const key = input.trim().toLowerCase();
  if (key in NAMED_COLORS) return NAMED_COLORS[key];
  for (const { pattern, toRgb } of COLOR_FORMATS) {
    const match = key.match(pattern);
    if (match) return toRgb(match);
  }
  throw new Error(`Unsupported color format: "${input}"`);
}
```

The table at the top of the file serves as the supported format specification, while parseColor is a generic loop over the table. Format-specific extraction functions and color space conversion functions are implemented privately at the bottom of the file.

### contrast.ts — Threshold Table

```typescript
const WCAG_THRESHOLDS = {
  normal: { AA: 4.5, AAA: 7 },
  large: { AA: 3, AAA: 4.5 },
} as const;
```

### index.ts — Pipeline Composition

```typescript
export function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(parseColor(fg));
  const l2 = relativeLuminance(parseColor(bg));
  return computeRatio(l1, l2);
}
```

## Error Handling

The only stage in the pipeline that can fail is parsing (String → RGB). The remaining stages (RGB → Luminance → Ratio → Compliance) are pure math operations that cannot fail. Since there is only one failure point, errors are not subdivided into custom types — a standard `Error` with a descriptive message is used.

## Type Definitions

```typescript
export type ComplianceLevel = 'AAA' | 'AA' | 'Fail';
export type TextSize = 'normal' | 'large';

export interface ContrastResult {
  ratio: number;
  normalText: { aa: boolean; aaa: boolean };
  largeText: { aa: boolean; aaa: boolean };
}
```

`RGB` is defined internally in `types.ts` but not exported from the public API.

## Public API

```typescript
contrastRatio(fg: string, bg: string): number
getContrastResult(fg: string, bg: string): ContrastResult
relativeLuminance(color: string): number
checkCompliance(ratio: number, textSize: TextSize): ComplianceLevel
```

## Issue Breakdown

### Issue 1: Project Setup and Type Definitions

- `package.json`, `tsconfig.json`, `vitest.config.ts`
- `src/types.ts`, `src/index.ts` (type re-export)

**Estimated size:** ~120 lines

### Issue 2: Basic Color Parsing (HEX, RGB, Named Colors)

- `src/parse.ts`: ColorFormat table structure + parseColor + HEX/RGB extraction
- `src/named-colors.ts`: CSS 148 named colors data

**Estimated size:** ~400 lines

### Issue 3: Advanced Color Parsing (HSL, LCH, OKLCH)

- `src/parse.ts` format table extension + color space conversion functions
- Angle unit parsing utilities (deg, rad, grad, turn)

**Estimated size:** ~350 lines

### Issue 4: Contrast Ratio and WCAG Compliance

- `src/luminance.ts`: sRGB → linear RGB → relative luminance
- `src/contrast.ts`: contrast ratio formula + WCAG compliance check
- `src/index.ts`: complete public API exports

**Estimated size:** ~350 lines

### Issue 5: CLI

- `src/cli.ts`: argument parsing, output formats (default/json/quiet), error handling

**Estimated size:** ~150 lines

## Implementation Order

```text
Issue 1 → Issue 2 → Issue 3 → Issue 4 → Issue 5
```

## Verification

Per issue:
1. `bun run test` (packages/wcag-contrast)
2. `turbo run check-types`
3. `biome check packages/wcag-contrast`

Final (after Issue 5):

```bash
bun run packages/wcag-contrast/src/cli.ts "#000" "#fff"
bun run packages/wcag-contrast/src/cli.ts "#777" "#fff" --json
```
