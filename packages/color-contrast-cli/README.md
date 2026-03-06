# @siluat/color-contrast-cli

WCAG 2.1 color contrast checker for the command line. Also usable as a library.

## Quick Start

No install needed — run directly:

```bash
npx @siluat/color-contrast-cli '#000' '#fff'
# or
bunx @siluat/color-contrast-cli '#000' '#fff'
# or
deno run npm:@siluat/color-contrast-cli '#000' '#fff'
```

```text
Contrast ratio: 21:1
Normal text: AAA ✓
Large text:  AAA ✓
```

## CLI

### JSON Output

```bash
npx @siluat/color-contrast-cli '#333' '#fff' --json
```

```json
{"ratio":12.63,"normalText":"AAA","largeText":"AAA"}
```

### CI Exit Code Check

Exit 0 on pass, exit 1 on fail. Checks against normal text:

```bash
npx @siluat/color-contrast-cli '#333' '#fff' --level AA
npx @siluat/color-contrast-cli '#333' '#fff' --level AAA
```

### Failure Case

```bash
npx @siluat/color-contrast-cli '#999' '#fff'
```

```text
Contrast ratio: 2.85:1
Normal text: Fail ✗
Large text:  Fail ✗
```

### Error Handling

The CLI prints error messages to stderr and exits with code 2 (distinguishing from `--level` failure which exits with code 1):

```bash
npx @siluat/color-contrast-cli 'not-a-color' '#fff'
# stderr: Error: Invalid color: "not-a-color"
# exit code: 2
```

With `--json`, errors are also printed to stderr as plain text, not JSON.

## Installation

For use as a library or for global CLI access:

```bash
npm install @siluat/color-contrast-cli
# or
pnpm add @siluat/color-contrast-cli
# or
yarn add @siluat/color-contrast-cli
# or
bun add @siluat/color-contrast-cli
```

### JSR

```bash
deno add jsr:@siluat/color-contrast-cli
# or
npx jsr add @siluat/color-contrast-cli
```

## Library

### Contrast Ratio

```typescript
import { contrastRatio } from '@siluat/color-contrast-cli';

contrastRatio('#000000', '#ffffff'); // 21
contrastRatio('#00000080', '#ffffff'); // alpha compositing supported
contrastRatio('rgb(0, 0, 0)', '#fff'); // RGB functional notation
contrastRatio('navy', 'white'); // CSS named colors
contrastRatio('oklch(60% 0.15 50)', 'white'); // wide-gamut colors
```

Returns the ratio as a `number`.

### WCAG Compliance Check

```typescript
import { checkContrast } from '@siluat/color-contrast-cli';

checkContrast('#333', '#fff');
// { ratio: 12.63, normalText: 'AAA', largeText: 'AAA' }

checkContrast('#777', '#fff');
// { ratio: 4.48, normalText: 'Fail', largeText: 'AA' }

checkContrast('#999', '#fff');
// { ratio: 2.85, normalText: 'Fail', largeText: 'Fail' }
```

### Error Handling

Both `contrastRatio` and `checkContrast` throw an `Error` for invalid color strings:

```typescript
contrastRatio('not-a-color', '#fff');
// Error: Invalid color: "not-a-color"
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

WCAG contrast ratio is defined between opaque sRGB colors. This tool automatically resolves input colors to opaque sRGB before calculating contrast, matching what browsers actually render.

**Alpha**: Colors with alpha are composited to produce the opaque color users see on screen. Background is composited over white (browser default), then foreground is composited over the result.

```typescript
contrastRatio('#00000080', '#ffffff'); // contrast of composited gray vs white
```

**Wide-gamut colors**: Colors in LAB, LCH, OKLAB, or OKLCH that fall outside the sRGB gamut are gamut-mapped using the CSS Color Level 4 algorithm (Section 13.2) — the same method browsers use to render these colors.
