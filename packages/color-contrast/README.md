# @siluat/color-contrast

WCAG color contrast ratio computation library. Zero runtime dependencies, browser compatible.

## Installation

```bash
npm install @siluat/color-contrast
# or
pnpm add @siluat/color-contrast
# or
bun add @siluat/color-contrast
```

### JSR

```bash
deno add jsr:@siluat/color-contrast
# or
npx jsr add @siluat/color-contrast
```

## Contrast Ratio

```typescript
import { contrastRatio } from '@siluat/color-contrast';

contrastRatio('#000000', '#ffffff'); // 21
contrastRatio('#00000080', '#ffffff'); // alpha compositing supported
contrastRatio('rgb(0, 0, 0)', '#fff'); // RGB functional notation
contrastRatio('navy', 'white'); // CSS named colors
contrastRatio('oklch(60% 0.15 50)', 'white'); // wide-gamut colors
```

Returns the ratio as a `number`.

## WCAG Compliance Check

```typescript
import { checkContrast } from '@siluat/color-contrast';

checkContrast('#333', '#fff');
// { ratio: 12.63, normalText: 'AAA', largeText: 'AAA' }

checkContrast('#777', '#fff');
// { ratio: 4.48, normalText: 'Fail', largeText: 'AA' }

checkContrast('#999', '#fff');
// { ratio: 2.85, normalText: 'Fail', largeText: 'Fail' }
```

## Color Suggestion

```typescript
import { suggestForeground } from '@siluat/color-contrast';

suggestForeground('#777', '#fff', 4.5);
// { suggested: '#767676', result: { ratio: 4.54, normalText: 'AA', largeText: 'AAA' } }

suggestForeground('#333', '#fff', 4.5);
// { suggested: null, result: null }  (already passes)
```

Returns a `SuggestResult` with the closest foreground color meeting the target ratio. The `suggested` and `result` fields are `null` when the pair already passes or no solution exists.

## Color Validation

Validate both colors upfront and collect all errors at once, instead of failing on the first invalid color:

```typescript
import { validateColors } from '@siluat/color-contrast';

validateColors('#000', '#fff'); // []
validateColors('#gg0000', '#zz0000');
// [
//   'Invalid color: "#gg0000"\n  Hex colors use characters 0-9 and a-f. Example: #ff0000',
//   'Invalid color: "#zz0000"\n  Hex colors use characters 0-9 and a-f. Example: #ff0000',
// ]
```

## Error Handling

Both `contrastRatio` and `checkContrast` throw an `Error` for invalid color strings:

```typescript
contrastRatio('not-a-color', '#fff');
// Error: Invalid color: "not-a-color"
//   Supported formats: #hex, named colors (red, blue, ...), rgb(), hsl(), ...

contrastRatio('#gg0000', '#fff');
// Error: Invalid color: "#gg0000"
//   Hex colors use characters 0-9 and a-f. Example: #ff0000
```

## API Reference

```typescript
type ComplianceLevel = 'AAA' | 'AA' | 'Fail';

interface ContrastResult {
  ratio: number;
  normalText: ComplianceLevel;
  largeText: ComplianceLevel;
}

interface SuggestResult {
  suggested: string | null;
  result: ContrastResult | null;
}

function contrastRatio(foreground: string, background: string): number;
function checkContrast(foreground: string, background: string): ContrastResult;
function suggestForeground(foreground: string, background: string, targetRatio: number): SuggestResult;
function validateColors(foreground: string, background: string): string[];
```

`ratio` is rounded to 2 decimal places. Range is 1 to 21.

WCAG 2.1 compliance thresholds:

| Level | Normal text | Large text |
|-------|-------------|------------|
| AAA   | >= 7        | >= 4.5     |
| AA    | >= 4.5      | >= 3       |

## Supported Color Formats

- HEX: `#RGB`, `#RRGGBB`, `#RGBA`, `#RRGGBBAA`
- Named colors: `red`, `navy`, `rebeccapurple`, `transparent` (148 named colors)
- RGB: `rgb(255 0 0)`, `rgb(255 0 0 / 0.5)`, `rgba(255, 0, 0, 0.5)`
- HSL: `hsl(120 100% 50%)`, `hsl(120 100% 50% / 0.5)`, `hsla(120, 100%, 50%, 0.5)`
- HWB: `hwb(120 0% 0%)`, `hwb(120 0% 0% / 0.5)`
- LAB: `lab(50% 40 59.5)`, `lab(50% 40 59.5 / 0.5)`
- LCH: `lch(52.2% 72.2 50)`, `lch(52.2% 72.2 50 / 0.5)`
- OKLAB: `oklab(59% 0.1 0.1)`, `oklab(59% 0.1 0.1 / 0.5)`
- OKLCH: `oklch(60% 0.15 50)`, `oklch(60% 0.15 50 / 0.5)`

## How Alpha and Wide-Gamut Colors Are Handled

WCAG contrast ratio is defined between opaque sRGB colors. This library automatically resolves input colors to opaque sRGB before calculating contrast, matching what browsers actually render.

**Alpha**: Colors with alpha are composited to produce the opaque color users see on screen. Background is composited over white (browser default), then foreground is composited over the result.

```typescript
contrastRatio('#00000080', '#ffffff'); // contrast of composited gray vs white
```

**Wide-gamut colors**: Colors in LAB, LCH, OKLAB, or OKLCH that fall outside the sRGB gamut are gamut-mapped using the CSS Color Level 4 algorithm (Section 13.2) — the same method browsers use to render these colors.

## CLI

For command-line usage, see [@siluat/color-contrast-cli](https://www.npmjs.com/package/@siluat/color-contrast-cli).
