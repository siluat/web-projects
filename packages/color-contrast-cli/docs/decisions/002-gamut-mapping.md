# 002: Gamut Mapping for Wide-Gamut Colors

## Status

Accepted

## Context

This tool supports CSS Color Level 4 color spaces (LAB, LCH, OKLAB, OKLCH) that can represent colors outside the sRGB gamut. WCAG 2.1 relative luminance is defined in sRGB. When a wide-gamut color is converted to sRGB, the resulting channel values may fall outside the 0–255 range.

## Options

### A. Clip to sRGB range

Clamp each sRGB channel to 0–255 after conversion.

- Simple to implement
- Can produce visually inaccurate colors: `oklch(90% 0.4 150)` clipped may land on a very different color than what the browser renders
- Contrast results may not reflect what users see

### B. Reject out-of-gamut colors

Throw an error when a color falls outside sRGB after conversion.

- Explicit about the limitation
- Rejects colors that are legitimately used in CSS and rendered by browsers
- Users with OKLCH-based design systems would be unable to use the tool

### C. CSS gamut mapping

Apply the gamut mapping algorithm defined in CSS Color Level 4. This is the same algorithm browsers use to render wide-gamut colors on sRGB displays.

- Produces the same sRGB color that the browser renders
- Contrast results match what users actually see on screen
- More complex to implement, but aligns with the CSS specification

## Decision

**Option C: CSS gamut mapping.**

This tool exists to evaluate accessibility. The relevant question is always "what contrast does the user perceive?" When a user writes `oklch(90% 0.4 150)` in CSS, the browser applies gamut mapping and renders a specific sRGB color. The tool should calculate contrast based on that same color.

Using a different method (clipping or rejection) would produce results that don't correspond to the actual rendered appearance, undermining the tool's purpose.

Reference: [CSS Color Level 4 — Gamut Mapping](https://www.w3.org/TR/css-color-4/#gamut-mapping)
