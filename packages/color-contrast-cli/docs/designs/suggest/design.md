# Design: Color Suggestion (`--suggest`)

## Problem

When a foreground/background color pair fails a WCAG contrast level, the user must manually experiment with colors to find a passing alternative. The `--suggest` flag automates this by recommending the closest color that meets the target.

## Design Decisions

### D1: Which color to adjust

**Decision: Adjust the foreground color only.**

- Backgrounds are typically part of a broader design system and harder to change in isolation.
- Foreground (text) color adjustments are the most common accessibility fix.
- Keeps the algorithm and output simple for v1.
- Future enhancement: a `--adjust bg` option could be added later.

### D2: Color space for adjustment

**Decision: Adjust lightness in OkLCH, keeping hue and chroma fixed.**

OkLCH is perceptually uniform — equal numeric changes correspond to equal perceived differences. By adjusting only the L (lightness) axis:

- The suggested color preserves the original hue and saturation intent.
- The perceptual difference is minimized.
- The existing `gamutMapOklch()` pipeline handles sRGB gamut clamping.

Alternatives considered:

- **RGB channel scaling:** Simple but produces unpredictable hue shifts.
- **HSL lightness adjustment:** Not perceptually uniform; large lightness steps can feel uneven.
- **HSV (Chrome DevTools approach):** DevTools adjusts V first, then S. Workable but HSV is not perceptually uniform. DevTools chose HSV because their color picker UI is HSV-based, not because of perceptual quality.
- **Lab lightness:** Reasonable, but OkLCH is more uniform (especially for blues) and already has full pipeline support in this codebase.

### D3: Suggestion direction

**Decision: Try both darker and lighter, pick the closer one.**

When the current contrast is insufficient, the foreground can be adjusted either darker or lighter. The algorithm tries both directions and returns the one with the smaller perceptual distance (Delta-L in OkLCH) from the original.

Edge cases:

- If only one direction can achieve the target (e.g., near-black foreground can only go lighter), return that one.
- If neither direction can achieve the target (e.g., target is 21:1 but background is mid-gray), return `null`.

### D4: Output format

**Decision: Return the suggested color as a hex string.**

- Hex is the most universal and compact CSS color format.
- All input formats ultimately resolve to sRGB for contrast calculation; hex is the natural sRGB representation.
- The verbose mode will show the suggested color's OkLCH values for users who want to understand the adjustment.

### D5: `--suggest` requires `--level`

**Decision: `--suggest` requires `--level` to define the target contrast ratio.**

Without a target level, there is no threshold to suggest toward. The `--size` option (default: `normal`) determines the specific ratio threshold (e.g., AA normal = 4.5, AAA large = 4.5).

If the color pair already passes the specified level, no suggestion is needed — the CLI reports this and exits normally.

### D6: Safety margin

**Decision: Add a small margin above the target ratio.**

Chrome DevTools adds +0.1 to WCAG target ratios; Leonardo adds +0.005. A margin prevents the suggested color from landing exactly on the threshold, where rounding or rendering differences could cause a failure.

The specific margin value will be determined during implementation and testing.

### D7: Alpha preservation

**Decision: Preserve the original alpha value.**

If the foreground has alpha < 1, the suggestion maintains the same alpha and only adjusts lightness. Contrast compliance is evaluated after alpha compositing.

### D8: Single suggestion per invocation

**Decision: Suggest for the specified `--level` only.**

No multi-level suggestion (e.g., showing both closest-AA and closest-AAA). Users can run the command twice with different levels.

## Algorithm

**Chosen approach: Target Luminance + OkLCH Binary Search** (Approach A, Chrome DevTools-inspired)

Three approaches were investigated during design. With hue and chroma fixed (L as the only free variable), all three produce the same result. Approach A was chosen for its ability to pre-determine impossible directions without searching. See [approach-a.md](../../learning/suggest/approach-a.md) for full analysis, and [approach-b.md](../../learning/suggest/approach-b.md), [approach-c.md](../../learning/suggest/approach-c.md) for alternatives.

```text
suggestForeground(fg, bg, targetRatio):
  1. bg → sRGB → linear → bgLum (background luminance)
  2. fg → sRGB → linear → fgLum (current foreground luminance)
  3. Current ratio >= targetRatio → return null (already passes)
  4. fg → OkLCH (fix C, H)
  5. Compute target luminance for each direction:
     darker:  targetLum = (bgLum + 0.05) / targetRatio - 0.05
     lighter: targetLum = (bgLum + 0.05) * targetRatio - 0.05
  6. For each direction where targetLum ∈ [0, 1]:
     a. Binary search on OkLCH L (C, H fixed):
        - OkLCH(L, C, H) → gamutMapOklch → sRGB → linear → luminance
        - |luminance - targetLum| < epsilon → converged
     b. Store candidate
  7. Return candidate with smaller |L_suggested - L_original|
     - One direction only → return that
     - Neither → return null
```

### Monotonicity verification

The binary search assumes that OkLCH L → WCAG luminance is monotonic (increasing L always increases luminance). This was empirically verified with `verify-monotonicity.ts` (co-located in this directory) across 14 test colors (varying chroma 0–0.4, hues covering red/green/blue/cyan/magenta).

**Result:** Non-monotonicity exists but is negligible:

- 7 of 14 colors showed violations, all caused by `gamutMapOklch()` chroma clipping
- Largest luminance drop: ~4.6e-5 (at extreme green, L ≈ 0.859)
- Contrast ratio impact: < 0.001 in all cases
- Most violations occur at L < 0.03 where luminance is near zero

Binary search convergence is not affected at these magnitudes. The non-monotonicity is a numerical artifact of gamut mapping's own binary search, not a systematic trend.

### Edge cases

| Case | Handling |
|---|---|
| Target luminance < 0 | Direction impossible (can occur in darker direction) |
| Target luminance > 1 | Direction impossible (can occur in lighter direction) |
| Both directions impossible | Return null (e.g., mid-gray background with 21:1 target) |
| Gamut mapping non-monotonicity | Negligible; verified empirically (see above) |
| Alpha < 1 | Preserve alpha, adjust L only. Evaluate contrast after compositing. |

## CLI Interface

```bash
# Suggest foreground color to meet AA for normal text
ccr '#777' '#fff' --suggest --level AA
# Output:
# Suggested foreground: #757575
# Contrast ratio: 4.59:1 (AA)

# With JSON output
ccr '#777' '#fff' --suggest --level AA --json
# Output:
# {"original":{"ratio":4.48,"normalText":"Fail",...},"suggested":{"color":"#757575","ratio":4.59,"normalText":"AA",...}}

# Already passing — no suggestion needed
ccr '#333' '#fff' --suggest --level AA
# Output:
# Contrast ratio: 12.63:1
# Already passes AA for normal text.

# With --size
ccr '#999' '#fff' --suggest --level AA --size large
```

### Validation rules

- `--suggest` without `--level` → error
- `--suggest` with `--verbose` → allowed (shows OkLCH trace of suggestion)
- `--suggest` with `--json` → allowed (includes suggestion in JSON output)

## Public API

```typescript
export interface SuggestResult {
  /** Suggested hex color, or null if no suggestion is possible. */
  suggested: string | null;
  /** Contrast result with the suggested color. Null if no suggestion. */
  result: ContrastResult | null;
}

/**
 * Suggest a foreground color adjustment to meet the target contrast ratio.
 */
export function suggestForeground(
  foreground: string,
  background: string,
  targetRatio: number,
): SuggestResult;
```

## Implementation Plan

### sRGB → OkLCH conversion

Extract private helpers from `gamut-map.ts` into reusable converters:

- `src/convert/linear-rgb-to-xyz.ts` — extract `linearRgbToXyz()` from `gamut-map.ts`
- `src/convert/xyz-to-oklab.ts` — already exists as public module
- `src/convert/oklab-to-oklch.ts` — already exists as public module
- `src/convert/srgb-to-oklch.ts` — new, composes the above: sRGB → linear → XYZ → OkLab → OkLCH
- Tests for the new conversion path
- Refactor `gamut-map.ts` to use the extracted modules instead of private copies

### Core suggestion algorithm

- `src/suggest.ts`:
  - `computeTargetLuminance(bgLum, targetRatio, direction)` — WCAG formula inversion
  - `suggestForeground(fg, bg, targetRatio)` — main function with binary search
- `src/suggest.test.ts`:
  - Known failing pairs → verify suggested color passes
  - Already passing pairs → returns null
  - Edge cases: near-black, near-white, mid-gray backgrounds
  - Both-direction preference (closer to original)
  - Alpha preservation
- Export from `src/index.ts`

### CLI integration

- Add `--suggest` flag to argument parser
- Wire `suggestForeground()` into main flow
- Human-readable and JSON output formatting
- CLI tests for new flag combinations and validation rules
- Update help text

### Verbose mode and documentation

- Verbose output showing OkLCH adjustment trace
- Update README with `--suggest` examples
- Update cli-improvement-ideas.md (mark as done)
- Update tracker.md

## Research References

Algorithm approach was informed by the following existing tools and research:

| Source | Approach | Color Space |
|---|---|---|
| Chrome DevTools `findFgColorForContrast` | Target luminance + gradient convergence | HSV |
| Adobe Leonardo `searchColors` | 3000-point scale + binary search | User-selectable (LAB, LCH, OKLCH, etc.) |
| Tanaguru Contrast-Finder | Brute-force grid search | HSB + RGB |
| arXiv:2512.05067 (Lalitha, 2025) | Binary search + gradient descent + constraint relaxation | OKLCH |

No published study directly compares suggestion quality across these tools. With a single free variable (lightness), the approaches produce equivalent results. Full approach analyses are archived in `docs/learning/suggest/`.
