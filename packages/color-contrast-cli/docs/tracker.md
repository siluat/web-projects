# Implementation Tracker

## Next Release

(No items scheduled)

## Package Split (`@siluat/color-contrast`)

Prerequisite for AI Agent Skill and Website work streams.

- [ ] Scaffold `packages/color-contrast/` (package.json, tsconfig, tsdown config)
- [ ] Move pure computation code to library package (types, parse/, convert/, contrast, luminance, alpha-composite, suggest, gamut-map)
- [ ] Move test files alongside source
- [ ] Update CLI imports to use `@siluat/color-contrast`
- [ ] Convert CLI `src/index.ts` to library re-export
- [ ] Publish library v1.0.0 (npm + JSR)
- [ ] Republish CLI (internal dependency changed from relative paths to `@siluat/color-contrast` package)

Key decisions:

- Batch module stays in CLI (text parsing/formatting is I/O layer)
- Re-export preserves backward compatibility for existing users
- Library targets zero runtime deps + browser compatibility

## AI Agent Skill

Depends on: Package Split

- [ ] Package skill based on skills.sh (Agent Skills standard)
  - [ ] `SKILL.md` skill file (YAML frontmatter + guide)
  - [ ] Reference docs (WCAG criteria table, API reference, usage patterns)
- [ ] Write SKILL.md (WCAG criteria, CLI/library API reference, workflow guide)
- [ ] Write reference docs (WCAG criteria table, API reference, design system audit guide)
- [ ] Deploy to skills.sh
- [ ] Installation test (`npx skills add`)

## Website (`apps/color-contrast-web/`)

Depends on: Package Split

- [ ] Scaffold Starlight (Astro-based docs framework) app
- [ ] Interactive Color Checker (React Island)
- [ ] Interactive Color Suggester (React Island)
- [ ] Batch Palette Audit tool (React Island)
- [ ] Library API docs page
- [ ] CLI docs page
- [ ] Skill installation/usage guide page
- [ ] Vercel deployment setup

## Released

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
