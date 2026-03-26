# 004: sRGB Gamma Decompression Threshold

## Status

Accepted

## Context

The sRGB gamma decompression function uses a piecewise formula with a threshold that separates the linear segment from the power-curve segment. Two values appear in different specifications:

- **0.03928** — WCAG 2.1 Section 1.4.3 relative luminance definition
- **0.04045** — IEC 61966-2-1 (the sRGB standard), CSS Color Level 4

The WCAG 2.1 value (0.03928) is a known transcription error. The correct value from the IEC sRGB standard is 0.04045, which ensures continuity between the linear and power-curve segments of the transfer function.

## Decision

**Use 0.04045 (IEC 61966-2-1 / CSS Color Level 4).**

### Rationale

1. **Correctness:** 0.04045 is the mathematically correct threshold that makes the sRGB transfer function continuous. The value 0.03928 creates a discontinuity at the junction point.

2. **CSS Color Level 4 alignment:** This project already adopts CSS Color Level 4 as the authoritative color science specification (see ADR 002 precedent for gamut mapping). CSS Color Level 4 uses 0.04045.

3. **APCA compatibility:** APCA also uses 0.04045. Using the same value reduces divergence when the APCA pipeline is added in the future.

4. **No practical impact:** For 8-bit sRGB inputs (0-255), the two thresholds produce identical compliance judgments. The affected range (sRGB values between 0.03928 and 0.04045, corresponding to 8-bit value 10) produces luminance differences on the order of 10^-6, which cannot change a pass/fail outcome against any WCAG threshold (3:1, 4.5:1, 7:1).

## References

- [IEC 61966-2-1:1999](https://webstore.iec.ch/en/publication/6169) — sRGB standard defining 0.04045
- [CSS Color Level 4 Section 10.2](https://www.w3.org/TR/css-color-4/#color-conversion-code) — uses 0.04045
- [WCAG 2.1 Section 1.4.3](https://www.w3.org/TR/WCAG21/#contrast-minimum) — uses 0.03928 (transcription error)
