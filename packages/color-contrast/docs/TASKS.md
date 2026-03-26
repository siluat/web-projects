# Tasks

## Next

- [ ] Scaffold Starlight (Astro-based docs framework) app
- [ ] Interactive Color Checker (React Island) (depends on: Scaffold Starlight)
- [ ] Interactive Color Suggester (React Island) (depends on: Scaffold Starlight)
- [ ] Batch Palette Audit tool (React Island) (depends on: Scaffold Starlight)
- [ ] Library API docs page (depends on: Scaffold Starlight)
- [ ] CLI docs page (depends on: Scaffold Starlight)
- [ ] Skill installation/usage guide page (depends on: Scaffold Starlight)
  - [ ] What the skill does and supported agent list
  - [ ] Installation command (`npx skills add siluat/skills --skill color-contrast`)
  - [ ] `/color-contrast` slash command usage examples
- [ ] Vercel deployment setup (depends on: Scaffold Starlight)

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
