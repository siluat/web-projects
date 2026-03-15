# Scripts

Development scripts for `@siluat/color-contrast-cli`. These are not published to npm.

## visual-check.ts

Generate an HTML page for side-by-side visual verification of the `--suggest` feature.

**Usage:**

```bash
bun scripts/visual-check.ts > /tmp/suggest-visual-check.html && open /tmp/suggest-visual-check.html
```

**What it shows:**

- Before/After comparison of original and suggested foreground colors on the same background
- Text rendered at three sizes (24px bold, 16px, 14px) for readability assessment
- Contrast ratios and WCAG compliance grades for each pair
- Test cases covering grays, saturated colors, light/dark backgrounds, and AA/AAA levels

**When to use:**

- Before releasing a new version with changes to the suggestion algorithm
- After modifying gamut mapping, color conversion, or binary search logic
- To verify that hue is preserved and suggested colors look natural

**Customization:**

Edit the `testCases` array in `visual-check.ts` to add or modify color pairs.
