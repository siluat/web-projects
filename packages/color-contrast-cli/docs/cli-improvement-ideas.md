# CLI Improvement Ideas

Ideas for improving the CLI's usability, inspired by [@googleworkspace/cli](https://github.com/googleworkspace/cli) and [CLI for Microsoft 365](https://github.com/pnp/cli-microsoft365).

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
| P2 | Batch input (`--batch`, stdin) | Medium | High |
| P2 | Output format expansion (`-o csv\|markdown`) | Medium | Medium |
| P3 | Shell completion | Medium | Medium |
| P3 | Public `parseColor` API | Low | Medium |
| P4 | Color suggestion (`--suggest`) | High | High |
| P4 | Distributable Skill | Medium | Medium |
