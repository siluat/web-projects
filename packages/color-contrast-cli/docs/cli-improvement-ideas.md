# CLI Improvement Ideas

Ideas for improving the CLI's usability, inspired by [@googleworkspace/cli](https://github.com/googleworkspace/cli) and [CLI for Microsoft 365](https://github.com/pnp/cli-microsoft365).

## 1. `--help` / `--version` Flags

Currently no `--help` or `--version` flag exists. Invalid arguments only show a one-line usage string.

- `contrast --help`: Show supported color formats, options, and usage examples
- `contrast --version`: Show package version
- Include color format examples in help output since color syntax is complex

## 2. Allow `--level` + `--json` Together

Currently `--level` and `--json` are mutually exclusive. In CI pipelines, it's common to want both: exit code for pass/fail AND JSON stdout for parsing.

```bash
result=$(contrast '#333' '#fff' --level AA --json)
# exit code 0 or 1 + JSON stdout
```

## 3. `--verbose` Mode

Show the internal conversion pipeline for transparency and education, especially useful for wide-gamut colors and alpha compositing.

```text
$ contrast 'oklch(60% 0.15 50)' 'white' --verbose

Foreground: oklch(60% 0.15 50)
  -> Parsed as OKLCH: L=0.60, C=0.15, H=50
  -> Gamut mapped to sRGB: rgb(186, 113, 67)
Background: white
  -> Parsed as named color: rgb(255, 255, 255)
Alpha compositing: not needed (both opaque)
Relative luminance: fg=0.1984, bg=1.0000
Contrast ratio: 4.28:1
Normal text: AA ✗
Large text:  AA ✓
```

## 4. Actionable Error Messages

Currently errors only say `Error: Invalid color: "xyz"`. Add context-aware hints.

```text
$ contrast 'rgb(300, 0, 0)' '#fff'
Error: Invalid color: "rgb(300, 0, 0)"
  RGB channel values must be 0-255.

$ contrast '#gg0000' '#fff'
Error: Invalid color: "#gg0000"
  Hex colors use characters 0-9 and a-f.
  Example: #ff0000
```

## 5. `--size normal|large` Option

Currently `--level` checks against normal text only. Add `--size large` to check against large text thresholds.

```bash
contrast '#777' '#fff' --level AA --size large   # passes (ratio 4.48 >= 3)
contrast '#777' '#fff' --level AA                 # fails  (ratio 4.48 < 4.5)
```

## 6. Batch Input Support

Process multiple color pairs at once via stdin, useful for design system palette audits.

```bash
echo "#000 #fff\n#333 #ccc\n#666 #999" | contrast --batch
echo "#000 #fff\n#333 #ccc" | contrast --batch -o csv
contrast --file palette-pairs.txt -o csv
```

## 7. Output Format Expansion

Add more output formats beyond human-readable text and JSON.

- `--output csv` (or `-o csv`): Export for spreadsheets
- `--output markdown` (or `-o markdown`): Embed in accessibility audit reports
- Keep `--json` as shorthand for `--output json`

## 8. Shell Completion

Generate shell completion scripts for Bash/Zsh/Fish.

```bash
contrast --completions bash > /etc/bash_completion.d/contrast
contrast --completions zsh > ~/.zsh/completions/_contrast
```

The 148 CSS named colors could be offered as completion candidates.

## 9. Color Suggestion (Advanced)

When a color pair fails a target level, suggest the closest alternative that passes. This is a high-effort, high-impact feature for future consideration.

## 10. Rename CLI Command: `contrast` -> `wcr`

The current bin name `contrast` is a generic English word. This causes potential bin name collisions, poor searchability, and no brand identity.

Rename to `wcr` (**W**CAG **C**ontrast **R**atio):

- 3 characters — fast to type
- Unique — no known bin name conflicts
- Searchable — "wcr cli" returns specific results
- Meaningful — directly references the WCAG standard this tool implements

Transition strategy using dual bin registration in package.json:

```json
"bin": {
  "wcr": "./dist/cli.js",
  "contrast": "./dist/cli.js"
}
```

Keep both during a minor version cycle, then drop `contrast` in the next major version.

## 11. Public `parseColor` API

Expose the internal color parser as a public API for color string validation use cases.

```typescript
import { parseColor } from '@siluat/color-contrast-cli';

parseColor('#ff0000'); // { space: 'srgb', r: 1, g: 0, b: 0, alpha: 1 }
parseColor('not-a-color'); // null
```

## 12. Distributable Skill

Publish an installable Skill that teaches AI agents (Claude Code, Cursor, etc.) to check contrast when color values change. A well-designed CLI is itself an AI interface — a Skill makes it discoverable.

## Priority Summary

| Priority | Idea | Effort | Impact |
|----------|------|--------|--------|
| P0 | Rename bin to `wcr` | Low | High |
| P0 | `--help` / `--version` | Low | High |
| P0 | `--level` + `--json` together | Low | Medium |
| P1 | `--verbose` conversion trace | Medium | High |
| P1 | Actionable error messages | Medium | High |
| P1 | `--size normal\|large` option | Low | Medium |
| P2 | Batch input (`--batch`, stdin) | Medium | High |
| P2 | Output format expansion (`-o csv\|markdown`) | Medium | Medium |
| P3 | Shell completion | Medium | Medium |
| P3 | Public `parseColor` API | Low | Medium |
| P4 | Color suggestion (`--suggest`) | High | High |
| P4 | Distributable Skill | Medium | Medium |
