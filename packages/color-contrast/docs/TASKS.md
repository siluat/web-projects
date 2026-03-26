# Tasks

## Next

(No items)

## In Progress

(No items)

## Done

(No items)

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
