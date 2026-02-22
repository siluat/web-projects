# 003: sRGB Channel Value Representation

## Status

Accepted

## Context

Parsed color values must be stored in memory before being passed to the contrast calculation pipeline. For sRGB colors (parsed from HEX, RGB, HSL, etc.), each channel can be represented in different numeric forms. The choice affects precision, pipeline complexity, and alignment with the CSS specification.

**Scope:** This decision applies to all sRGB channel representations throughout the pipeline — `SRGBColor` (parse results), `OpaqueRGB` (composited colors), and any other intermediate sRGB types. Non-sRGB color spaces (LAB, LCH, OKLAB, OKLCH, XYZ) retain their natural units as defined by their respective specifications.

## Options

### A. 0–255 integers

Store each channel as an integer in the 0–255 range — the native representation of 8-bit color.

- No precision loss at parse time
- Requires a division by 255 before every calculation step (gamma correction, luminance, etc.)
- Defers the floating-point conversion rather than eliminating it
- Does not generalize to non-8-bit sources (e.g., `color(srgb 0.3 0.5 0.8)`)

### B. 0–1 floating-point

Normalize each channel to the 0–1 range immediately after parsing.

- Matches the native representation in CSS Color Level 4 (`color(srgb r g b)` uses 0–1 values)
- Feeds directly into gamma correction and luminance formulas without extra conversion
- Introduces a floating-point rounding error of at most ~10⁻¹⁷ per channel at parse time
- Error propagates through the pipeline to at most ~10⁻¹⁵ in the final contrast ratio — twelve orders of magnitude smaller than the minimum relevant threshold gap for 8-bit HEX inputs

### C. Rational numbers (numerator/denominator pairs)

Store each channel as an exact fraction (e.g., `{ numerator: 128, denominator: 255 }`).

- Lossless representation for all 8-bit values
- Requires a custom rational arithmetic layer; incompatible with standard math operations
- Adds significant complexity with no practical benefit for WCAG contrast judgment

## Decision

**Option B: 0–1 floating-point.**

CSS Color Level 4 defines sRGB channel values in the 0–1 range, and the WCAG relative luminance formula operates on that range directly. Storing values in this form keeps the pipeline simple and spec-aligned.

The floating-point precision loss (~10⁻¹⁵ in the final contrast ratio) is not a concern in practice. WCAG compliance is determined by comparing contrast ratios against fixed thresholds (3:1, 4.5:1, 7:1). For any pair of 8-bit colors, the minimum distance between a computed ratio and a threshold is far larger than the maximum rounding error introduced by this representation.

Reference: [CSS Color Level 4 — sRGB Colors](https://www.w3.org/TR/css-color-4/#numeric-srgb)

## Pipeline

The 0-1 representation is maintained across the entire sRGB pipeline:

1. **Parse** — `SRGBColor` channels normalized to 0-1 at parse time (e.g., HEX `#FF0000` → R = `1.0`)
2. **Composite** — `OpaqueRGB` channels remain in 0-1 after alpha compositing
3. **Linearize** — gamma decompression operates on 0-1 input, produces 0-1 `LinearRGB`
4. **Luminance** — relative luminance computed from 0-1 linear values

No stage converts to 0-255 or any other integer representation. This eliminates quantization error that would otherwise be introduced by a roundtrip through integer values (~0.004 per channel, compared to ~10⁻¹⁷ from float representation).
