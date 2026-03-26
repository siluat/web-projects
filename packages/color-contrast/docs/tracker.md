# Implementation Tracker

## Next Release

(No items scheduled)

## Package Split (`@siluat/color-contrast`)

Prerequisite for AI Agent Skill and Website work streams.

- [ ] Publish library v1.0.0 (npm + JSR)
- [ ] Publish CLI v1.0.0 (internal dependency changed to `@siluat/color-contrast` package)

Key decisions:

- Batch module stays in CLI (text parsing/formatting is I/O layer)
- Re-export preserves backward compatibility for existing users
- Library targets zero runtime deps + browser compatibility

## Website (`apps/color-contrast-web/`)

Depends on: Package Split

- [ ] Scaffold Starlight (Astro-based docs framework) app
- [ ] Interactive Color Checker (React Island)
- [ ] Interactive Color Suggester (React Island)
- [ ] Batch Palette Audit tool (React Island)
- [ ] Library API docs page
- [ ] CLI docs page
- [ ] Skill installation/usage guide page
  - [ ] What the skill does and supported agent list
  - [ ] Installation command (`npx skills add siluat/skills --skill color-contrast`)
  - [ ] `/color-contrast` slash command usage examples
- [ ] Vercel deployment setup

## AI Agent Skill (Completed)

Published at [siluat/skills](https://github.com/siluat/skills) (`skills/color-contrast/`).

Install: `npx skills add siluat/skills --skill color-contrast`

Skill structure:

- `SKILL.md` — WCAG thresholds, decision tree, quick commands, agent patterns
- `command/color-contrast.md` — `/color-contrast` slash command workflow
- `references/wcag-criteria.md` — WCAG 2.1 SC 1.4.3, 1.4.6, 1.4.11 deep-dive
- `references/cli-usage.md` — Full `ccr` CLI reference
- `references/design-system-audit.md` — Batch palette audit workflow

## Released

See [CLI CHANGELOG.md](../../color-contrast-cli/CHANGELOG.md) for full release history.

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
