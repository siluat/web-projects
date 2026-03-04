# 001: Alpha Compositing Strategy

## Status

Accepted

## Context

This tool supports CSS color formats that include alpha values (e.g., `rgb(255 0 0 / 0.5)`, `#FF000080`, `transparent`). WCAG contrast ratio is defined only between opaque colors. When input colors have alpha, the tool must decide how to handle them before calculating contrast.

## Options

### A. Auto-composite foreground only

Composite the foreground color over the background. Reject background colors with alpha.

- Handles the most common case (semi-transparent text over solid background)
- Fails when background also has alpha

### B. Reject alpha entirely

Throw an error for any color with alpha.

- Simple and explicit
- Rejects legitimate CSS colors like `transparent` or `rgba()`
- Forces users to manually composite before checking contrast

### C. Ignore alpha

Strip alpha and treat all colors as opaque.

- Produces results that don't match what users actually see on screen
- A red at 10% opacity looks nearly white, but would be evaluated as full red
- Defeats the purpose of an accessibility tool

### D. Composite both foreground and background

Composite background over white first, then composite foreground over the result. White is the default page background in browsers.

- Matches browser rendering: the final surface is always opaque
- Produces contrast values that correspond to what users actually see
- Handles all valid CSS color inputs without rejection

## Decision

**Option D: Composite both foreground and background.**

The purpose of this tool is to evaluate the contrast that users perceive on screen. When a browser renders semi-transparent colors, it composites them against the underlying surface. The tool should do the same.

Compositing order:

1. Composite background over white (browser default page color)
2. Composite foreground over the result from step 1

This means `contrastRatio('rgba(0,0,0,0.5)', 'white')` evaluates the contrast between medium gray (the composited result) and white — which is what the user actually sees.

**Compositing color space:** Alpha compositing is performed in gamma-encoded sRGB space, matching CSS Compositing Level 1 and browser rendering behavior. This decision applies to both WCAG 2.1 and APCA pipelines — parsing and compositing are shared layers, and the algorithms diverge only at the linearization stage onward.
