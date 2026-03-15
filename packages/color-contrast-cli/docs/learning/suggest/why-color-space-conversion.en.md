# Why Color Space Conversion Is Needed for the Suggest Feature

The `--suggest` feature automatically adjusts a foreground color to meet a WCAG contrast ratio target. This process fundamentally requires converting between color spaces. This document explains why from three perspectives.

## 1. Hex values are gamma-encoded

A hex notation like `#777777` is an sRGB value with **gamma encoding** applied. Gamma encoding is a non-linear transformation that allocates more numeric range to dark tones, exploiting the human eye's greater sensitivity to brightness differences in shadows.

The sRGB transfer function (IEC 61966-2-1) is a piecewise function, not a simple power curve:

```text
if value ≤ 0.04045:  linear = value / 12.92
else:                linear = ((value + 0.055) / 1.055) ^ 2.4
```

For `#777777`:

| Step | Value |
|------|-------|
| Hex → integer | 119 |
| Normalize to 0–1 | 119 / 255 ≈ 0.467 |
| Gamma decode (linear) | ≈ 0.184 |

0.467 vs 0.184 is a large gap. Using gamma-encoded values directly in math operations (luminance calculation, color interpolation, etc.) produces **physically incorrect results**. The WCAG relative luminance formula must be applied to linear RGB values to be accurate.

## 2. Adjusting only lightness requires a color space with separated axes

The core requirement of the suggest feature is **"match the contrast ratio while preserving the original color's hue and saturation as much as possible."** This demands a color space where lightness can be controlled independently.

### Why direct adjustment in sRGB does not work

The R, G, and B channels of sRGB **entangle brightness and hue**. Scaling all three channels equally moves the color toward gray, while scaling them unequally shifts the hue. There is no way to change "just the brightness" in sRGB.

### Why HSL is also inadequate

HSL separates H (hue), S (saturation), and L (lightness), but it is **not perceptually uniform**. A blue at L=50% and a yellow at L=50% appear vastly different in perceived brightness. Equal adjustments to HSL's L produce unequal perceptual brightness changes depending on the hue, making it difficult to converge precisely on a contrast ratio target.

### Why OkLCH is the right choice

OkLCH is the polar representation of OkLab, with L (lightness), C (chroma), and H (hue) cleanly separated and **perceptually uniform**. Equal changes in L feel like equal brightness changes regardless of the color. This means:

- Fixing C and H while **binary-searching only L** preserves hue and saturation while achieving the target contrast ratio.
- Perceptual distance is minimized, so the suggested color looks as close to the original as possible.

## 3. The conversion pipeline

The full conversion paths used by the suggest feature are described below.

### Foreground → OkLCH (preparing for search)

```text
sRGB (gamma-encoded hex input)
  ↓  Gamma decode (IEC 61966-2-1)
Linear sRGB
  ↓  3×3 matrix multiplication
XYZ-D65 (absolute color space)
  ↓  OkLab transform (via LMS)
OkLab (perceptually uniform)
  ↓  Cartesian → polar conversion
OkLCH (L, C, H)
```

Implementation: `src/convert/srgb-to-oklch.ts`

### Binary search iteration (L candidate → luminance evaluation)

```text
OkLCH(L_candidate, C, H)
  ↓  gamutMapOklch (sRGB gamut mapping)
sRGB (gamma-encoded)
  ↓  alphaComposite (flatten transparency)
sRGB (opaque)
  ↓  Gamma decode
Linear sRGB
  ↓  ITU-R BT.709 weighted sum
Relative luminance → compare to target luminance
```

This pipeline runs on every iteration of the binary search to evaluate how close a candidate L value is to the target luminance.

## Summary

| Problem | What color space conversion solves |
|---------|-----------------------------------|
| Hex values are gamma-encoded | Decoding to linear RGB is required for accurate luminance calculation |
| sRGB cannot adjust brightness independently | OkLCH separates L, C, and H axes |
| HSL is perceptually non-uniform | OkLCH's perceptual uniformity enables minimal adjustment to reach the target |

For the design decision on color space selection (D2), see [design.md](../../designs/suggest/design.md). For the mathematical background of the conversion pipeline, see [wide-gamut-conversions.md](../wide-gamut-conversions.md).
