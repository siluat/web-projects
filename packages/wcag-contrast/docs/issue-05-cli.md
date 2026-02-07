# Issue 5: CLI

## Scope

- `src/cli.ts`: argument parsing, output formats (default/json/quiet), error handling

## Details

### Usage

```bash
wcag-contrast <foreground> <background> [options]
```

### Options

| Option | Description |
|--------|-------------|
| `--json` | Output in JSON format |
| `--quiet` | Output only the contrast ratio number |
| `--help` | Show help message |

### Output Formats

#### Default

```text
Contrast ratio: 21:1

Normal text: AA ✓  AAA ✓
Large text:  AA ✓  AAA ✓
```

#### JSON (`--json`)

```json
{
  "ratio": 21,
  "normalText": { "aa": true, "aaa": true },
  "largeText": { "aa": true, "aaa": true }
}
```

#### Quiet (`--quiet`)

```text
21
```

### Error Handling

- Missing arguments: show usage message, exit code 1
- Invalid color format: show error message, exit code 1
- Success: exit code 0

### Entry Point Configuration

Register CLI entry point in the `bin` field of `package.json`.

## Estimated Size

~150 lines

## Verification

```bash
bun run packages/wcag-contrast/src/cli.ts "#000" "#fff"
bun run packages/wcag-contrast/src/cli.ts "#777" "#fff" --json
bun run packages/wcag-contrast/src/cli.ts "#777" "#fff" --quiet
bun run packages/wcag-contrast/src/cli.ts --help
bun run packages/wcag-contrast/src/cli.ts  # missing arguments error
bun run packages/wcag-contrast/src/cli.ts "invalid" "#fff"  # invalid format error
```
