# Implementation Tracker

## Progress

### Phase 1: HEX-only Pipeline

- [ ] PR 1: Project setup and type definitions
- [ ] PR 2: HEX parser
- [ ] PR 3: sRGB conversion + alpha compositing
- [ ] PR 4: Luminance/contrast ratio + public API
- [ ] PR 5: CLI

### Phase 2: sRGB Family Extension

- [ ] PR 6: Named colors parser
- [ ] PR 7: RGB parser
- [ ] PR 8: HSL parser + conversion
- [ ] PR 9: HWB parser + conversion

### Phase 3: Wide-gamut Color Support

- [ ] PR 10: Wide-gamut color conversion pipeline
- [ ] PR 11: CSS Color Level 4 gamut mapping
- [ ] PR 12: LAB/LCH/OKLAB/OKLCH parsers

## PR Details

### PR 1: Project Setup and Type Definitions

- **Files:** `package.json`, `tsconfig.json`, `vitest.config.ts`, `src/types.ts`, `src/index.ts`
- **Scope:** Build/test infrastructure, all type definitions from the type system above
- **Notes:** tsconfig extends `@siluat/typescript-config/library.json`, vitest uses `passWithNoTests: true`
- **Verification:** `turbo run static-check --filter=@siluat/wcag-contrast`, `turbo run test --filter=@siluat/wcag-contrast`
- **Status:** Pending

### PR 2: HEX Parser

- **Files:** `src/parse/utils.ts`, `src/parse/hex.ts`, `src/parse/index.ts`, tests
- **Scope:** Parse #RGB, #RRGGBB, #RGBA, #RRGGBBAA using declarative patterns
- **Verification:** HEX conversion accuracy, alpha value accuracy
- **Status:** Pending

### PR 3: sRGB <-> Linear RGB Conversion + Alpha Compositing

- **Files:** `src/convert/srgb-linear.ts`, `src/convert/index.ts`, `src/alpha-composite.ts`, tests
- **Scope:**
  - sRGB gamma correction (WCAG 2.1 Section 1.4.3)
  - Alpha compositing (ADR-001): composite background over white -> composite foreground over result
- **Verification:** Gamma threshold (0.04045), `rgba(0,0,0,0.5)` over white -> rgb(128,128,128)
- **Status:** Pending

### PR 4: WCAG Luminance/Contrast Ratio + Public API

- **Files:** `src/luminance.ts`, `src/contrast.ts`, `src/index.ts` (modified), tests
- **Scope:**
  - Relative luminance: `L = 0.2126*R + 0.7152*G + 0.0722*B`
  - Contrast ratio: `(L_lighter + 0.05) / (L_darker + 0.05)`, rounded to 2 decimal places
  - Level grading: normalText (7/4.5), largeText (4.5/3)
  - `contrastRatio`, `checkContrast` public API implementation
  - Error: `Error: Invalid color: "not-a-color"`
- **Verification:** Must match README HEX examples:
  - `contrastRatio('#000000', '#ffffff')` -> 21
  - `checkContrast('#333', '#fff')` -> `{ ratio: 12.63, normalText: 'AAA', largeText: 'AAA' }`
  - `checkContrast('#777', '#fff')` -> `{ ratio: 4.48, normalText: 'AA', largeText: 'AAA' }`
  - `checkContrast('#999', '#fff')` -> `{ ratio: 2.85, normalText: 'Fail', largeText: 'AA' }`
- **Status:** Pending

### PR 5: CLI Implementation

- **Files:** `src/cli.ts`, `package.json` (bin field), tests
- **Scope:** Direct `process.argv` parsing
  - Default: human-readable, `--json`: single-line JSON, `--level AA|AAA`: exit code 0/1
  - Error: stderr, exit code 2
- **Verification:** Reproduce README CLI examples (HEX-based)
- **Status:** Pending

### PR 6: Named Colors Parser

- **Files:** `src/parse/named-colors.ts`, tests
- **Scope:** 148 CSS named colors (including `transparent`)
- **Verification:** black, white, red, navy, rebeccapurple, transparent
- **Integration test:** `contrastRatio('navy', 'white')` -> 15.94
- **Status:** Pending

### PR 7: RGB Parser

- **Files:** `src/parse/rgb.ts`, tests
- **Scope:** `rgb(255 0 0)`, `rgb(255 0 0 / 0.5)`, `rgba(255, 0, 0, 0.5)` — supports both comma and space syntax
- **Verification:** `contrastRatio('rgb(0, 0, 0)', '#fff')` -> 21
- **Status:** Pending

### PR 8: HSL Parser + Conversion

- **Files:** `src/parse/hsl.ts`, `src/convert/hsl-to-srgb.ts`, tests
- **Scope:** hsl()/hsla() parsing (deg, rad, grad, turn units), HSL -> sRGB conversion (CSS Color Level 4 Section 7)
- **Verification:** `hsl(0 100% 50%)` = red, each hue unit conversion
- **Status:** Pending

### PR 9: HWB Parser + Conversion

- **Files:** `src/parse/hwb.ts`, `src/convert/hwb-to-srgb.ts`, tests
- **Scope:** hwb() parsing, HWB -> sRGB conversion (CSS Color Level 4 Section 8)
- **Verification:** whiteness + blackness > 100% normalization
- **Status:** Pending

### PR 10: Wide-gamut Color Conversion Pipeline

- **Files:** `src/convert/lab-to-xyz.ts`, `src/convert/lch-to-lab.ts`, `src/convert/oklab-to-xyz.ts`, `src/convert/oklch-to-oklab.ts`, `src/convert/xyz-to-linear-rgb.ts`, tests
- **Scope:**
  - CIE LAB <-> XYZ D65 (CSS Color Level 4 Section 10.1)
  - CIE LCH -> LAB (Section 10.1)
  - OKLAB <-> XYZ via LMS (Section 10.3)
  - OKLCH -> OKLAB (Section 10.3)
  - XYZ D65 -> Linear sRGB (Section 10.2, 3x3 matrix)
- **Verification:** Spec conversion examples, floating-point tolerance configuration
- **Status:** Pending

### PR 11: CSS Color Level 4 Gamut Mapping

- **Files:** `src/gamut-map.ts`, tests
- **Scope:** Section 13.2 algorithm — chroma binary search in OKLCH, deltaEOK < 0.02 convergence, 64 iteration limit
- **Notes:** See `docs/decisions/002-gamut-mapping.md`
- **Verification:** Colors within sRGB gamut are not mapped, out-of-gamut colors compared against browser reference values
- **Status:** Pending

### PR 12: LAB/LCH/OKLAB/OKLCH Parsers

- **Files:** `src/parse/lab.ts`, `src/parse/lch.ts`, `src/parse/oklab.ts`, `src/parse/oklch.ts`, tests
- **Scope:** Parse 4 wide-gamut color formats, support both percentage and number values
- **Integration test:** contrastRatio calculation with wide-gamut colors works correctly through gamut mapping
- **Status:** Pending

## Type System

```typescript
// Parse results
interface SRGBColor  { space: 'srgb'; r: number; g: number; b: number; alpha: number }
interface HSLColor   { space: 'hsl'; h: number; s: number; l: number; alpha: number }
interface HWBColor   { space: 'hwb'; h: number; w: number; b: number; alpha: number }
interface LABColor   { space: 'lab'; l: number; a: number; b: number; alpha: number }
interface LCHColor   { space: 'lch'; l: number; c: number; h: number; alpha: number }
interface OKLABColor { space: 'oklab'; l: number; a: number; b: number; alpha: number }
interface OKLCHColor { space: 'oklch'; l: number; c: number; h: number; alpha: number }
type ParsedColor = SRGBColor | HSLColor | HWBColor | LABColor | LCHColor | OKLABColor | OKLCHColor;

// Intermediate types for computation
interface LinearRGB { r: number; g: number; b: number }   // 0-1, linear light
interface XYZColor  { x: number; y: number; z: number }   // CIE XYZ D65
interface OpaqueRGB { r: number; g: number; b: number }   // 0-255, sRGB, composited

// Public API types
type ComplianceLevel = 'AAA' | 'AA' | 'Fail';
interface ContrastResult { ratio: number; normalText: ComplianceLevel; largeText: ComplianceLevel }
```

## File Structure

```text
packages/wcag-contrast/
  package.json
  tsconfig.json
  vitest.config.ts
  src/
    index.ts                 # Public API
    types.ts                 # All type definitions
    parse/
      index.ts               # parseColor entry point
      hex.ts                 # HEX parser
      rgb.ts                 # rgb()/rgba() parser
      hsl.ts                 # hsl()/hsla() parser
      hwb.ts                 # hwb() parser
      lab.ts                 # lab() parser
      lch.ts                 # lch() parser
      oklab.ts               # oklab() parser
      oklch.ts               # oklch() parser
      named-colors.ts        # CSS named colors map
      utils.ts               # Common parsing utilities
    convert/
      index.ts               # Conversion entry point
      srgb-linear.ts         # sRGB <-> Linear RGB
      hsl-to-srgb.ts         # HSL -> sRGB
      hwb-to-srgb.ts         # HWB -> sRGB
      lab-to-xyz.ts          # LAB -> XYZ
      lch-to-lab.ts          # LCH -> LAB
      oklab-to-xyz.ts        # OKLAB -> XYZ
      oklch-to-oklab.ts      # OKLCH -> OKLAB
      xyz-to-linear-rgb.ts   # XYZ -> Linear RGB
    gamut-map.ts             # CSS Color Level 4 gamut mapping
    alpha-composite.ts       # Alpha compositing
    luminance.ts             # WCAG relative luminance
    contrast.ts              # Contrast ratio and level grading
    cli.ts                   # CLI entry point
```

## Spec References

| Algorithm | Source | PR |
|-----------|--------|-----|
| sRGB inverse gamma correction | WCAG 2.1 1.4.3 | 3 |
| Alpha compositing | CSS Compositing Level 1 | 3 |
| Relative luminance / Contrast ratio | WCAG 2.1 1.4.3 | 4 |
| HSL -> sRGB | CSS Color Level 4 Section 7 | 8 |
| HWB -> sRGB | CSS Color Level 4 Section 8 | 9 |
| LAB <-> XYZ, LCH -> LAB | CSS Color Level 4 Section 10.1 | 10 |
| OKLAB <-> XYZ, OKLCH -> OKLAB | CSS Color Level 4 Section 10.3 | 10 |
| XYZ -> Linear sRGB | CSS Color Level 4 Section 10.2 | 10 |
| CSS gamut mapping | CSS Color Level 4 Section 13.2 | 11 |

## Notes

- **Floating-point precision:** Error accumulates as conversion chains grow longer. Set appropriate epsilon values in tests
- **Gamut mapping infinite loop prevention:** Binary search iteration limit of 64
- **README example value verification:** If computed values differ from README after implementation, update README
