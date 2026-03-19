# Implementation Tracker

## Next Release

- [x] Batch input (`--batch`) — [design doc](designs/batch/design.md)
  - [x] Batch line parser (bracket-aware splitting)
  - [x] Batch processing and formatters
  - [x] CLI integration (--batch flag)
  - [x] README and tracker update

## Released

### v0.7.0

- [x] Color suggestion (`--suggest`) — [design doc](designs/suggest/design.md)
  - [x] sRGB → OkLCH conversion (extract from gamut-map.ts)
  - [x] Core suggestion algorithm (suggest.ts)
  - [x] CLI integration (--suggest flag)
  - [x] Verbose mode and documentation

See [CHANGELOG.md](../CHANGELOG.md) for full release history.

## Spec References

| Algorithm | Source |
|-----------|--------|
| sRGB inverse gamma correction | WCAG 2.1 1.4.3 |
| Alpha compositing | CSS Compositing Level 1 |
| Relative luminance / Contrast ratio | WCAG 2.1 1.4.3 |
| HSL -> sRGB | CSS Color Level 4 Section 7 |
| HWB -> sRGB | CSS Color Level 4 Section 8 |
| LAB <-> XYZ, LCH -> LAB | CSS Color Level 4 Section 10.1 |
| OKLAB <-> XYZ, OKLCH -> OKLAB | CSS Color Level 4 Section 10.3 |
| XYZ -> Linear sRGB | CSS Color Level 4 Section 10.2 |
| CSS gamut mapping | CSS Color Level 4 Section 13.2 |
| lab()/lch() parsing | CSS Color Level 4 Section 10.1 |
| oklab()/oklch() parsing | CSS Color Level 4 Section 10.3 |
| XYZ -> OKLAB, OKLAB -> OKLCH | CSS Color Level 4 Section 10.3 |

## Notes

- **Floating-point precision:** Error accumulates as conversion chains grow longer. Set appropriate epsilon values in tests
- **Gamut mapping infinite loop prevention:** Binary search iteration limit of 64
- **README example value verification:** If computed values differ from README after implementation, update README
