# CLI Improvement Ideas

Ideas for improving the CLI's usability, inspired by [@googleworkspace/cli](https://github.com/googleworkspace/cli) and [CLI for Microsoft 365](https://github.com/pnp/cli-microsoft365).

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

## Distributable Skill

Publish an installable Skill that teaches AI agents (Claude Code, Cursor, etc.) to check contrast when color values change. A well-designed CLI is itself an AI interface — a Skill makes it discoverable.

## Priority Summary

| Priority | Idea | Effort | Impact |
|----------|------|--------|--------|
| P2 | Output format expansion (`-o csv\|markdown`) | Medium | Medium |
| P3 | Shell completion | Medium | Medium |
| P4 | Distributable Skill | Medium | Medium |
