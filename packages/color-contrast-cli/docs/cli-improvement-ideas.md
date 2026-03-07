# CLI Improvement Ideas

Ideas for improving the CLI's usability, inspired by [@googleworkspace/cli](https://github.com/googleworkspace/cli) and [CLI for Microsoft 365](https://github.com/pnp/cli-microsoft365).

## `--verbose` Mode

Show the internal conversion pipeline for transparency and education, especially useful for wide-gamut colors and alpha compositing.

```text
$ ccr 'oklch(60% 0.15 50)' 'white' --verbose

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

## Actionable Error Messages

Currently errors only say `Error: Invalid color: "xyz"`. Add context-aware hints.

```text
$ ccr 'rgb(300, 0, 0)' '#fff'
Error: Invalid color: "rgb(300, 0, 0)"
  RGB channel values must be 0-255.

$ ccr '#gg0000' '#fff'
Error: Invalid color: "#gg0000"
  Hex colors use characters 0-9 and a-f.
  Example: #ff0000
```

## `--size normal|large` Option

Currently `--level` checks against normal text only. Add `--size large` to check against large text thresholds.

```bash
ccr '#777' '#fff' --level AA --size large   # passes (ratio 4.48 >= 3)
ccr '#777' '#fff' --level AA                 # fails  (ratio 4.48 < 4.5)
```

## Batch Input Support

Process multiple color pairs at once via stdin, useful for design system palette audits.

```bash
echo "#000 #fff\n#333 #ccc\n#666 #999" | ccr --batch
echo "#000 #fff\n#333 #ccc" | ccr --batch -o csv
ccr --file palette-pairs.txt -o csv
```

## Output Format Expansion

Add more output formats beyond human-readable text and JSON.

- `--output csv` (or `-o csv`): Export for spreadsheets
- `--output markdown` (or `-o markdown`): Embed in accessibility audit reports
- Keep `--json` as shorthand for `--output json`

## Shell Completion

Generate shell completion scripts for Bash/Zsh/Fish.

```bash
ccr --completions bash > /etc/bash_completion.d/ccr
ccr --completions zsh > ~/.zsh/completions/_ccr
```

The 148 CSS named colors could be offered as completion candidates.

## Color Suggestion (Advanced)

When a color pair fails a target level, suggest the closest alternative that passes. This is a high-effort, high-impact feature for future consideration.

## Public `parseColor` API

Expose the internal color parser as a public API for color string validation use cases.

```typescript
import { parseColor } from '@siluat/color-contrast-cli';

parseColor('#ff0000'); // { space: 'srgb', r: 1, g: 0, b: 0, alpha: 1 }
parseColor('not-a-color'); // null
```

## Distributable Skill

Publish an installable Skill that teaches AI agents (Claude Code, Cursor, etc.) to check contrast when color values change. A well-designed CLI is itself an AI interface — a Skill makes it discoverable.

## Priority Summary

| Priority | Idea | Effort | Impact |
|----------|------|--------|--------|
| P1 | `--verbose` conversion trace | Medium | High |
| P1 | Actionable error messages | Medium | High |
| P1 | `--size normal\|large` option | Low | Medium |
| P2 | Batch input (`--batch`, stdin) | Medium | High |
| P2 | Output format expansion (`-o csv\|markdown`) | Medium | Medium |
| P3 | Shell completion | Medium | Medium |
| P3 | Public `parseColor` API | Low | Medium |
| P4 | Color suggestion (`--suggest`) | High | High |
| P4 | Distributable Skill | Medium | Medium |
