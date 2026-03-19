# @siluat/color-contrast-cli

WCAG Color Contrast Ratio Checker for the command line. Also usable as a library.

## Quick Start

Try without installing:

```bash
npx @siluat/color-contrast-cli '#000' '#fff'
```

For regular use, install globally:

```bash
npm install -g @siluat/color-contrast-cli
```

Then use the short `ccr` command:

```bash
ccr '#000' '#fff'
```

```text
Contrast ratio: 21:1
Normal text: AAA ✓
Large text:  AAA ✓
```

Run `ccr --help` to see all options and supported color formats.

## CLI

### JSON Output

```bash
ccr '#333' '#fff' --json
```

```json
{"ratio":12.63,"normalText":"AAA","largeText":"AAA"}
```

### CI Exit Code Check

Exit 0 on pass, exit 1 on fail. Checks against normal text by default:

```bash
ccr '#333' '#fff' --level AA
ccr '#333' '#fff' --level AAA
```

Use `--size large` to check against large text thresholds (AA >= 3, AAA >= 4.5). WCAG defines "large text" as 18pt (24px) or above, or 14pt (18.66px) bold or above:

```bash
ccr '#777' '#fff' --level AA --size large
# exit code: 0 (ratio 4.48 >= 3)
```

Combine with `--json` to get structured output alongside the exit code:

```bash
ccr '#333' '#fff' --level AA --json
# stdout: {"ratio":12.63,"normalText":"AAA","largeText":"AAA"}
# exit code: 0
```

### Color Suggestion

When a color pair fails a target level, suggest the closest accessible foreground color:

```bash
ccr '#777' '#fff' --suggest --level AA
```

```text
Suggested foreground: #767676
Contrast ratio: 4.54:1 (AA)
```

The suggested color preserves the original hue and saturation by adjusting only lightness in the OkLCH color space. Use `--size large` for large text thresholds, and `--json` for structured output:

```bash
ccr '#777' '#fff' --suggest --level AA --json
```

```json
{"original":{"ratio":4.48,"normalText":"Fail","largeText":"AA"},"suggested":{"color":"#767676","ratio":4.54,"normalText":"AA","largeText":"AAA"}}
```

If the pair already passes, no suggestion is made. If the target cannot be met, the CLI reports this and exits with code 1.

### Batch Mode

Process multiple color pairs at once via stdin — useful for design system palette audits:

```bash
echo -e "#000 #fff\n#333 #ccc\n#666 #999" | ccr --batch
```

```text
#000 #fff → 21:1 AAA / AAA
#333 #ccc → 8.28:1 AAA / AAA
#666 #999 → 2.16:1 Fail / Fail
```

Use `--json` for structured output:

```bash
echo -e "#000 #fff\n#333 #ccc" | ccr --batch --json
```

```json
[{"foreground":"#000","background":"#fff","ratio":21,"normalText":"AAA","largeText":"AAA"},{"foreground":"#333","background":"#ccc","ratio":8.28,"normalText":"AAA","largeText":"AAA"}]
```

Use `--level` to check all pairs and get a single exit code (0 if all pass, 1 if any fail):

```bash
echo -e "#000 #fff\n#666 #999" | ccr --batch --level AA
# exit code: 1 (second pair fails)
```

Combine with `--suggest` to get suggestions for failing pairs:

```bash
echo -e "#777 #fff\n#333 #fff" | ccr --batch --suggest --level AA
```

```text
#777 #fff → Suggested: #767676 4.54:1 (AA)
#333 #fff → Already passes AA
```

Input format supports comments (`//`), blank lines, tab-separated or space-separated pairs. Functional colors like `rgb()` and `oklch()` are handled by bracket-aware splitting:

```text
// Design system palette audit
#000 #fff
rgb(255, 0, 0) white
oklch(60% 0.15 50)	#ffffff
```

Invalid lines are reported as errors and processing continues. Exit code 2 indicates at least one error (takes priority over level failure). Note: `--verbose` cannot be combined with `--batch`.

### Verbose Mode

Use `--verbose` to see the full conversion trace — parsed values, color space conversions, alpha compositing, luminance, and contrast evaluation:

```bash
ccr 'oklch(60% 0.15 50)' white --verbose
```

```text
Foreground: oklch(60% 0.15 50)
  -> Parsed as OKLCH: L=0.6, C=0.15, H=50
  -> Gamut mapped to sRGB: rgb(196, 96, 22)
Background: white
  -> Parsed as NAMED: rgb(255, 255, 255)
Alpha compositing: not needed (both opaque)
Relative luminance: fg=0.2017, bg=1
Contrast ratio: 4.17:1
Normal text: Fail ✗
Large text:  AA ✓
```

Combine `--suggest` with `--verbose` to see both the conversion trace and the OkLCH adjustment details:

```bash
ccr '#777' '#fff' --suggest --level AA --verbose
```

```text
Foreground: #777
  -> Parsed as HEX: rgb(119, 119, 119)
Background: #fff
  -> Parsed as HEX: rgb(255, 255, 255)
Alpha compositing: not needed (both opaque)
Relative luminance: fg=0.1845, bg=1
Contrast ratio: 4.48:1
Normal text: Fail ✗
Large text:  AA ✓
Suggestion:
  Original OkLCH: L=0.5693, C=0, H=180
  Suggested OkLCH: L=0.5658, C=0, H=180
  Direction: darker
  Suggested foreground: #767676
  Contrast ratio: 4.54:1 (AA)
```

Note: `--verbose` cannot be combined with `--json`.

### Failure Case

```bash
ccr '#999' '#fff'
```

```text
Contrast ratio: 2.85:1
Normal text: Fail ✗
Large text:  Fail ✗
```

### Error Handling

The CLI prints error messages to stderr and exits with code 2 (distinguishing from `--level` failure which exits with code 1):

```bash
ccr 'not-a-color' '#fff'
# stderr: Error: Invalid color: "not-a-color"
#           Supported formats: #hex, named colors (red, blue, ...), rgb(), hsl(), ...
# exit code: 2

ccr '#gg0000' '#fff'
# stderr: Error: Invalid color: "#gg0000"
#           Hex colors use characters 0-9 and a-f. Example: #ff0000
# exit code: 2
```

Error messages include format-specific hints when the intended format can be detected. With `--json`, errors are also printed to stderr as plain text, not JSON.

## Installation

### Global (CLI)

```bash
npm install -g @siluat/color-contrast-cli
```

This registers the `ccr` command globally.

### Local (library or project-scoped CLI)

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

### Run without installing

```bash
npx @siluat/color-contrast-cli '#000' '#fff'
# or
bunx @siluat/color-contrast-cli '#000' '#fff'
# or
deno run npm:@siluat/color-contrast-cli '#000' '#fff'
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

### Color Suggestion

```typescript
import { suggestForeground } from '@siluat/color-contrast-cli';

suggestForeground('#777', '#fff', 4.5);
// { suggested: '#767676', result: { ratio: 4.54, normalText: 'AA', largeText: 'AAA' } }

suggestForeground('#333', '#fff', 4.5);
// { suggested: null, result: null }  (already passes)
```

Returns a `SuggestResult` with the closest foreground color meeting the target ratio. The `suggested` and `result` fields are `null` when the pair already passes or no solution exists.

### Color Validation

Validate both colors upfront and collect all errors at once, instead of failing on the first invalid color:

```typescript
import { validateColors } from '@siluat/color-contrast-cli';

validateColors('#000', '#fff'); // []
validateColors('#gg0000', '#zz0000');
// [
//   'Invalid color: "#gg0000"\n  Hex colors use characters 0-9 and a-f. Example: #ff0000',
//   'Invalid color: "#zz0000"\n  Hex colors use characters 0-9 and a-f. Example: #ff0000',
// ]
```

### Error Handling

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

WCAG contrast ratio is defined between opaque sRGB colors. This tool automatically resolves input colors to opaque sRGB before calculating contrast, matching what browsers actually render.

**Alpha**: Colors with alpha are composited to produce the opaque color users see on screen. Background is composited over white (browser default), then foreground is composited over the result.

```typescript
contrastRatio('#00000080', '#ffffff'); // contrast of composited gray vs white
```

**Wide-gamut colors**: Colors in LAB, LCH, OKLAB, or OKLCH that fall outside the sRGB gamut are gamut-mapped using the CSS Color Level 4 algorithm (Section 13.2) — the same method browsers use to render these colors.
