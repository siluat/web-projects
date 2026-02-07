# Issue 4: Contrast Ratio and WCAG Compliance

## Scope

- `src/luminance.ts`: sRGB → linear RGB → relative luminance
- `src/contrast.ts`: contrast ratio formula + WCAG compliance check
- `src/index.ts`: complete public API exports

## Details

### luminance.ts

Convert sRGB values to linear RGB, then compute relative luminance.

```typescript
// sRGB → linear RGB (gamma decoding)
// WCAG 2.1 formula: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance

export function relativeLuminance(rgb: RGB): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(linearize);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
```

`linearize` function:
- Normalize 0-255 → 0-1
- sRGB gamma decoding (linear/non-linear branch at threshold 0.04045)

### contrast.ts

#### Contrast Ratio Calculation

```typescript
// WCAG 2.1: (L1 + 0.05) / (L2 + 0.05) where L1 >= L2
export function computeRatio(l1: number, l2: number): number
```

#### WCAG Threshold Table

```typescript
const WCAG_THRESHOLDS = {
  normal: { AA: 4.5, AAA: 7 },
  large: { AA: 3, AAA: 4.5 },
} as const;
```

#### Compliance Check

```typescript
export function checkCompliance(ratio: number, textSize: TextSize): ComplianceLevel
export function getComplianceResult(l1: number, l2: number): ContrastResult
```

### index.ts — Complete Public API

```typescript
export function contrastRatio(fg: string, bg: string): number
export function getContrastResult(fg: string, bg: string): ContrastResult
export function relativeLuminance(color: string): number
export function checkCompliance(ratio: number, textSize: TextSize): ComplianceLevel
export type { ComplianceLevel, TextSize, ContrastResult } from './types';
```

## Test Cases

### Relative Luminance

- Black (`#000`): 0
- White (`#fff`): 1
- Verify known intermediate values

### Contrast Ratio

- Black vs White: 21:1
- Same color: 1:1
- Verify against WCAG example values

### WCAG Compliance

- ratio >= 7.0 → normal AAA, large AAA
- 4.5 <= ratio < 7.0 → normal AA, large AAA
- 3.0 <= ratio < 4.5 → normal Fail, large AA
- ratio < 3.0 → all Fail

## Estimated Size

~350 lines

## Verification

```bash
bun run test --filter=@siluat/wcag-contrast
turbo run check-types --filter=@siluat/wcag-contrast
biome check packages/wcag-contrast
```
