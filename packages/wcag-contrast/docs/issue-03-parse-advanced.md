# Issue 3: Advanced Color Parsing (HSL, LCH, OKLCH)

## Scope

- `src/parse.ts` format table extension + color space conversion functions
- Angle unit parsing utilities (deg, rad, grad, turn)

## Details

### Additional Formats

| Format | Pattern | Example |
|--------|---------|---------|
| HSL function | `hsl(h, s%, l%)` | `hsl(0, 100%, 50%)` |
| HSLA function | `hsla(h, s%, l%, a)` | `hsla(0, 100%, 50%, 0.5)` |
| LCH function | `lch(L C H)` | `lch(50 30 120)` |
| OKLCH function | `oklch(L C H)` | `oklch(0.5 0.15 120)` |

### Angle Unit Parsing

The hue values in HSL, LCH, and OKLCH support various angle units:

| Unit | Conversion | Example |
|------|------------|---------|
| `deg` (default) | As-is | `120deg`, `120` |
| `rad` | × 180/π | `2.094rad` |
| `grad` | × 0.9 | `133.33grad` |
| `turn` | × 360 | `0.333turn` |

### Color Space Conversions

#### HSL → RGB

Standard HSL to RGB conversion algorithm.

#### LCH → RGB

CIE LCH → CIE Lab → CIE XYZ (D65) → linear sRGB → sRGB conversion chain.

#### OKLCH → RGB

OKLCH → OKLab → linear sRGB → sRGB conversion chain.

### Implementation Location

All color space conversion functions are implemented privately within `parse.ts`. From the pipeline perspective, they are all implementation details of the "String → RGB" stage.

## Test Cases

- HSL: `hsl(0, 100%, 50%)` → red, `hsl(120, 100%, 50%)` → green
- HSL angle units: `hsl(0.5turn, 100%, 50%)`, `hsl(3.14159rad, 100%, 50%)`
- HSLA: `hsla(0, 100%, 50%, 0.5)`
- LCH: compare against known color values
- OKLCH: compare against known color values
- Edge cases: hue normalization (above 360, negative values)

## Estimated Size

~350 lines

## Verification

```bash
bun run test --filter=@siluat/wcag-contrast
turbo run check-types --filter=@siluat/wcag-contrast
biome check packages/wcag-contrast
```
