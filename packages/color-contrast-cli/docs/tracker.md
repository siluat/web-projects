# Implementation Tracker

## Progress

### Phase 1: HEX-only Pipeline

- [x] PR 1: Project setup and type definitions
- [x] PR 2: HEX parser
- [x] PR 3: sRGB conversion + alpha compositing
- [x] PR 4: Luminance/contrast ratio + public API
- [x] PR 5: CLI
- [x] PR 6: Publish preparation (npm + JSR)

### Phase 2: sRGB Family Extension

- [x] PR 7: Named colors parser
- [x] PR 8: RGB parser
- [x] PR 9: HSL parser + conversion
- [x] PR 10: HWB parser + conversion

**Phase 2 release checklist:**

- [x] README "Supported Color Formats" section: move Named colors, RGB, HSL, HWB to "Currently supported"
- [x] README library examples: uncomment `contrastRatio('navy', 'white')` etc.
- [x] Version bump and publish

### Phase 3: Wide-gamut Color Support

- [x] PR 11: Wide-gamut color conversion pipeline
- [x] PR 12: CSS Color Level 4 gamut mapping
- [ ] PR 13: LAB/LCH/OKLAB/OKLCH parsers

**Phase 3 release checklist (0.3.0):**

- [ ] README "Supported Color Formats" section: move LAB, LCH, OKLAB, OKLCH from "Planned" to "Currently supported"
- [ ] README "How Alpha and Wide-Gamut Colors Are Handled" section: update wide-gamut paragraph to reflect implemented status
- [ ] README library examples: add wide-gamut color example (e.g., `contrastRatio('oklch(60% 0.15 50)', 'white')`)
- [ ] Version bump and publish

### Phase 4: AI-Friendly Enhancements

AI agents (Claude Code, Cursor, etc.) can execute shell commands directly, so a well-designed CLI is itself an AI interface. This phase focuses on making the CLI and library more effective for other people's AI agents to consume.

- [ ] Structured JSON errors: output errors as JSON when `--json` is used
- [ ] Resolved colors: include the actual computed colors (after alpha compositing / named color resolution) in output
- [ ] Batch/stdin input: process multiple color pairs at once, avoiding repeated process spawn overhead
- [ ] Color suggestion: suggest the closest alternative color that meets a target WCAG level
- [ ] Public `parseColor` API: expose the color parser for color string validation use cases
- [ ] Distributable Skill: publish an installable Skill that teaches AI agents to check contrast when color values change

## PR Details

### PR 1: Project Setup and Type Definitions

- **Files:** `package.json`, `tsconfig.json`, `src/types.ts`, `src/index.ts`
- **Scope:** Build/test infrastructure, all type definitions from the type system above
- **Notes:** tsconfig extends `@siluat/typescript-config/library.json`, test runner is Bun (`bun test`)
- **Verification:** `turbo run check-types --filter=@siluat/color-contrast-cli`, `turbo run test --filter=@siluat/color-contrast-cli`
- **Status:** Done

### PR 2: HEX Parser

- **Files:** `src/parse/utils.ts`, `src/parse/hex.ts`, `src/parse/index.ts`, tests
- **Scope:** Parse #RGB, #RRGGBB, #RGBA, #RRGGBBAA using declarative patterns
- **Verification:** HEX conversion accuracy, alpha value accuracy
- **Status:** Done

### PR 3: sRGB <-> Linear RGB Conversion + Alpha Compositing

- **Files:** `src/convert/srgb-linear.ts`, `src/convert/index.ts`, `src/alpha-composite.ts`, tests
- **Scope:**
  - sRGB gamma correction (WCAG 2.1 Section 1.4.3)
  - Alpha compositing (ADR-001): composite background over white -> composite foreground over result
- **Verification:** Gamma threshold (0.04045), `rgba(0,0,0,0.5)` over white -> rgb(128,128,128)
- **Status:** Done

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
  - `checkContrast('#777', '#fff')` -> `{ ratio: 4.48, normalText: 'Fail', largeText: 'AA' }`
  - `checkContrast('#999', '#fff')` -> `{ ratio: 2.85, normalText: 'Fail', largeText: 'Fail' }`
- **Status:** Done

### PR 5: CLI Implementation

- **Files:** `src/cli.ts`, `package.json` (bin field), tests
- **Scope:** Direct `process.argv` parsing
  - Default: human-readable, `--json`: single-line JSON, `--level AA|AAA`: exit code 0/1
  - Error: stderr, exit code 2
- **Verification:** Reproduce README CLI examples (HEX-based)
- **Status:** Done

### PR 6: Publish Preparation (npm + JSR)

- **Files:** `package.json`, `tsdown.config.ts`, `jsr.json`, `.gitignore`, `README.md`, all source files (import extensions)
- **Scope:**
  - Remove `private`, bump version to 0.1.0, add public package metadata
  - Add tsdown build pipeline (ADR-006): `exports` and `bin` point to `dist/`
  - Shebang changed to `#!/usr/bin/env node` for npm consumers
  - `files: ["dist"]`, `prepublishOnly` script
  - Add `jsr.json` for JSR registry support
  - Update README: distinguish implemented vs planned features, add JSR install instructions
- **Verification:** type-check, tests, build, `node dist/cli.js`, `npm pack --dry-run`
- **Status:** Done

### PR 7: Named Colors Parser

- **Files:** `src/parse/named-colors.ts`, `src/parse/index.ts` (dispatcher), tests
- **Scope:** 148 CSS named colors (including `transparent`)
- **Verification:** black, white, red, navy, rebeccapurple, transparent
- **Integration test:** `contrastRatio('navy', 'white')` -> 16.01
- **Status:** Done

### PR 8: RGB Parser

- **Files:** `src/parse/rgb.ts`, `src/parse/index.ts` (dispatcher), tests
- **Scope:** `rgb(255 0 0)`, `rgb(255 0 0 / 0.5)`, `rgba(255, 0, 0, 0.5)` — supports both comma and space syntax
- **Verification:** `contrastRatio('rgb(0, 0, 0)', '#fff')` -> 21
- **Status:** Done

### PR 9: HSL Parser + Conversion

- **Files:** `src/parse/hsl.ts`, `src/convert/hsl-to-srgb.ts`, `src/parse/index.ts` (dispatcher), `src/index.ts` (parseOrThrow HSL→sRGB conversion), tests
- **Scope:** hsl()/hsla() parsing (deg, rad, grad, turn units), HSL -> sRGB conversion (CSS Color Level 4 Section 7)
- **Verification:** `hsl(0 100% 50%)` = red, each hue unit conversion
- **Status:** Done

### PR 10: HWB Parser + Conversion

- **Files:** `src/parse/hwb.ts`, `src/convert/hwb-to-srgb.ts`, `src/parse/index.ts` (dispatcher), `src/index.ts` (parseOrThrow HWB→sRGB conversion), tests
- **Scope:** hwb() parsing, HWB -> sRGB conversion (CSS Color Level 4 Section 8)
- **Verification:** whiteness + blackness > 100% normalization
- **Status:** Done

### PR 11: Wide-gamut Color Conversion Pipeline

- **Files:** `src/convert/lab-to-xyz.ts`, `src/convert/lch-to-lab.ts`, `src/convert/oklab-to-xyz.ts`, `src/convert/oklch-to-oklab.ts`, `src/convert/xyz-to-linear-rgb.ts`, tests
- **Scope:**
  - CIE LAB <-> XYZ D65 (CSS Color Level 4 Section 10.1)
  - CIE LCH -> LAB (Section 10.1)
  - OKLAB <-> XYZ via LMS (Section 10.3)
  - OKLCH -> OKLAB (Section 10.3)
  - XYZ D65 -> Linear sRGB (Section 10.2, 3x3 matrix)
- **Verification:** Spec conversion examples, floating-point tolerance configuration
- **Learning doc:** `docs/learning/wide-gamut-conversions.md`
- **Status:** Done

### PR 12: CSS Color Level 4 Gamut Mapping

- **Files:** `src/gamut-map.ts`, `src/convert/srgb-linear.ts` (`linearToSrgbChannel` added), `src/convert/index.ts`, tests
- **Scope:** Section 13.2 algorithm — chroma binary search in OKLCH, deltaEOK < 0.02 convergence, 64 iteration limit
- **Notes:** See `docs/decisions/002-gamut-mapping.md`
- **Verification:** In-gamut passthrough, out-of-gamut colors compared against Color.js 0.6.1 reference values, achromatic/NaN hue edge cases
- **Status:** Done

### PR 13: LAB/LCH/OKLAB/OKLCH Parsers

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
interface OpaqueRGB { r: number; g: number; b: number }   // 0-1, sRGB, composited

// Public API types
type ComplianceLevel = 'AAA' | 'AA' | 'Fail';
interface ContrastResult { ratio: number; normalText: ComplianceLevel; largeText: ComplianceLevel }
```

## File Structure

```text
packages/color-contrast-cli/
  package.json
  tsconfig.json
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
| HSL -> sRGB | CSS Color Level 4 Section 7 | 9 |
| HWB -> sRGB | CSS Color Level 4 Section 8 | 10 |
| LAB <-> XYZ, LCH -> LAB | CSS Color Level 4 Section 10.1 | 11 |
| OKLAB <-> XYZ, OKLCH -> OKLAB | CSS Color Level 4 Section 10.3 | 11 |
| XYZ -> Linear sRGB | CSS Color Level 4 Section 10.2 | 11 |
| CSS gamut mapping | CSS Color Level 4 Section 13.2 | 12 |

## Notes

- **Floating-point precision:** Error accumulates as conversion chains grow longer. Set appropriate epsilon values in tests
- **Gamut mapping infinite loop prevention:** Binary search iteration limit of 64
- **README example value verification:** If computed values differ from README after implementation, update README
