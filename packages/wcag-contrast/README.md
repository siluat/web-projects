# @siluat/wcag-contrast

WCAG 2.1 color contrast checker. Available as both a library and a CLI.

## Installation

```bash
npm install @siluat/wcag-contrast
# or
pnpm add @siluat/wcag-contrast
# or
yarn add @siluat/wcag-contrast
# or
bun add @siluat/wcag-contrast
```

## Library

### Contrast Ratio

```typescript
import { contrastRatio } from '@siluat/wcag-contrast';

contrastRatio('#000000', '#ffffff'); // 21
contrastRatio('rgb(0, 0, 0)', '#fff'); // 21
contrastRatio('navy', 'white'); // 15.94
```

Returns the ratio as a `number`.

### WCAG Compliance Check

```typescript
import { checkContrast } from '@siluat/wcag-contrast';

checkContrast('#333', '#fff');
// { ratio: 12.63, normalText: 'AAA', largeText: 'AAA' }

checkContrast('#777', '#fff');
// { ratio: 4.48, normalText: 'Fail', largeText: 'AA' }

checkContrast('#999', '#fff');
// { ratio: 2.85, normalText: 'Fail', largeText: 'Fail' }
```

## API Reference

```typescript
type ComplianceLevel = 'AAA' | 'AA' | 'Fail';

interface ContrastResult {
  ratio: number;
  normalText: ComplianceLevel;
  largeText: ComplianceLevel;
}

function contrastRatio(foreground: string, background: string): number;
function checkContrast(foreground: string, background: string): ContrastResult;
```

`ratio` is rounded to 2 decimal places. Range is 1 to 21.

WCAG 2.1 compliance thresholds:

| Level | Normal text | Large text |
|-------|-------------|------------|
| AAA   | >= 7        | >= 4.5     |
| AA    | >= 4.5      | >= 3       |

## CLI

```bash
npx @siluat/wcag-contrast '#000' '#fff'
```

Also available via `pnpm dlx @siluat/wcag-contrast` or `bunx @siluat/wcag-contrast`.

Output:

```text
Contrast ratio: 21:1
Normal text: AAA ✓
Large text:  AAA ✓
```

Failure case:

```bash
npx @siluat/wcag-contrast '#999' '#fff'
```

```text
Contrast ratio: 2.85:1
Normal text: Fail ✗
Large text:  Fail ✗
```

JSON output:

```bash
npx @siluat/wcag-contrast '#333' '#fff' --json
```

```json
{"ratio":12.63,"normalText":"AAA","largeText":"AAA"}
```

CI exit code check (exit 0 on pass, exit 1 on fail). Checks against normal text:

```bash
npx @siluat/wcag-contrast '#333' '#fff' --level AA
npx @siluat/wcag-contrast '#333' '#fff' --level AAA
```

## Supported Color Formats

All static CSS color values are supported:

- Named colors: `red`, `navy`, `rebeccapurple`, `transparent` (148 named colors)
- HEX: `#RGB`, `#RRGGBB`, `#RGBA`, `#RRGGBBAA`
- RGB: `rgb(255 0 0)`, `rgb(255 0 0 / 0.5)`, `rgba(255, 0, 0, 0.5)`
- HSL: `hsl(120 100% 50%)`, `hsl(120 100% 50% / 0.5)`, `hsla(120, 100%, 50%, 0.5)`
- HWB: `hwb(120 0% 0%)`, `hwb(120 0% 0% / 0.5)`
- LAB: `lab(50% 40 59.5)`, `lab(50% 40 59.5 / 0.5)`
- LCH: `lch(52.2% 72.2 50)`, `lch(52.2% 72.2 50 / 0.5)`
- OKLAB: `oklab(59% 0.1 0.1)`, `oklab(59% 0.1 0.1 / 0.5)`
- OKLCH: `oklch(60% 0.15 50)`, `oklch(60% 0.15 50 / 0.5)`

Both modern space-separated syntax and legacy comma-separated syntax are supported for `rgb()` and `hsl()`.

## How Alpha and Wide-Gamut Colors Are Handled

WCAG contrast ratio is defined between opaque sRGB colors. This tool automatically resolves input colors to opaque sRGB before calculating contrast, matching what browsers actually render.

**Alpha**: Colors with alpha are composited to produce the opaque color users see on screen. Background is composited over white (browser default), then foreground is composited over the result.

```typescript
contrastRatio('rgba(0, 0, 0, 0.5)', 'white'); // contrast of composited gray vs white
```

**Wide-gamut colors**: Colors in LAB, LCH, OKLAB, or OKLCH that fall outside the sRGB gamut are gamut-mapped using the CSS Color Level 4 algorithm — the same method browsers use to render these colors.

## Errors

Both `contrastRatio` and `checkContrast` throw an `Error` for invalid color strings:

```typescript
contrastRatio('not-a-color', '#fff');
// Error: Invalid color: "not-a-color"
```

The CLI prints the error message to stderr and exits with code 2 (distinguishing from `--level` failure which exits with code 1):

```bash
npx @siluat/wcag-contrast 'not-a-color' '#fff'
# stderr: Error: Invalid color: "not-a-color"
# exit code: 2
```

With `--json`, errors are also printed to stderr as plain text, not JSON.
