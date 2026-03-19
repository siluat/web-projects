# Design: Batch Input (`--batch`)

## Problem

The CLI currently processes a single foreground/background color pair per invocation. Design system palette audits often require checking dozens or hundreds of color pairs. Users must either write shell loops or invoke the CLI repeatedly, losing the ability to get a single pass/fail exit code for the entire set.

The `--batch` flag reads color pairs from stdin and processes them in a single invocation, enabling workflows like `cat palette.txt | ccr --batch --level AA`.

## Design Decisions

### D1: Input format — bracket-aware whitespace split (tab fallback)

**Decision: Split on tab if present, otherwise split on the first space at bracket depth 0.**

- If a tab character exists, split on the first tab
- Otherwise, find the first space where parenthesis depth is 0
- Skip blank lines and lines starting with `//` (comments)
- `#` comments are not supported because they conflict with hex color notation

This handles all supported color formats without requiring quoting:

```text
// Design system palette audit
#000 #fff
#333 #ccc
rgb(255, 0, 0) white
oklch(60% 0.15 50)	#ffffff
```

### D2: Flag compatibility

| Combination | Behavior |
|-------------|----------|
| `--batch` alone | One-line summary per pair |
| `--batch --json` | JSON array output |
| `--batch --level` | Check each pair, exit 1 if any fail |
| `--batch --suggest --level` | Suggest for failing pairs |
| `--batch --suggest` | **Error** (`--suggest` requires `--level`) |
| `--batch --verbose` | **Error** (multi-line per-pair output is unsuitable for batch) |
| `--batch` + positional args | **Error** (reads from stdin, no args needed) |

### D3: Error handling — per-line reporting, continue processing

- Invalid color on a line → record as error entry, continue to next line
- Exit code priority: 2 (any error) > 1 (level failure) > 0 (all pass)
- Empty stdin → error message, exit 2

### D4: Output format

**Human-readable (one-line summary):**

```text
#000 #fff → 21:1 AAA / AAA
#333 #ccc → 7.87:1 AAA / AAA
#666 #999 → 2.02:1 Fail / Fail
```

With `--level`, all results are still printed (unlike single mode which suppresses output). The exit code reflects aggregate pass/fail — users need to see which pairs failed.

**Suggest mode:**

```text
#777 #fff → Suggested: #767676 4.54:1 (AA)
#333 #fff → Already passes AA
```

**JSON:**

```json
[
  {"foreground":"#000","background":"#fff","ratio":21,"normalText":"AAA","largeText":"AAA"},
  {"foreground":"#666","background":"#999","ratio":2.02,"normalText":"Fail","largeText":"Fail"}
]
```

**JSON + suggest:**

```json
[
  {"foreground":"#777","background":"#fff","original":{"ratio":4.48,"normalText":"Fail","largeText":"AA"},"suggested":{"color":"#767676","ratio":4.54,"normalText":"AA","largeText":"AAA"}},
  {"foreground":"#333","background":"#fff","original":{"ratio":12.63,"normalText":"AAA","largeText":"AAA"},"suggested":null}
]
```

**Error entries:**

Human-readable: `invalid-color #fff → Error: Invalid color: "invalid-color"`

JSON: `{"foreground":"invalid-color","background":"#fff","error":"Invalid color: \"invalid-color\""}`

### D5: Scope — `--batch` only, `--file` and `-o csv|markdown` deferred

- `--file <path>` is a shortcut for `cat file | ccr --batch` — separate PR
- `-o` flag is an independent feature — separate release

### D6: async main() conversion

- Reading stdin requires `await Bun.stdin.text()` (or equivalent)
- Convert `main()` to async, add `.catch()` at call site
- Existing synchronous paths remain unchanged in behavior

## CLI Interface

```bash
# Basic batch
echo -e "#000 #fff\n#333 #ccc\n#666 #999" | ccr --batch

# JSON output
echo -e "#000 #fff\n#333 #ccc" | ccr --batch --json

# Level check (exit 1 if any pair fails)
echo -e "#000 #fff\n#666 #999" | ccr --batch --level AA

# Suggest mode
echo -e "#777 #fff\n#999 #fff" | ccr --batch --suggest --level AA

# Error handling (invalid line is reported, rest continues)
echo -e "#000 #fff\ninvalid color\n#333 #ccc" | ccr --batch

# Verbose is not allowed with batch
echo -e "#000 #fff" | ccr --batch --verbose  # → error
```

## Implementation Plan

### Batch line parser

Pure function to split a single input line into a foreground/background pair:

- `src/batch/parse-line.ts` — bracket-depth-aware splitting
- `src/batch/parse-line.test.ts` — hex, named, functional colors, tabs, comments, edge cases

### Batch processing and formatters

Pure functions for batch → result transformation and output formatting:

- `src/batch/types.ts` — `BatchLineResult`, `BatchResult`
- `src/batch/process-batch.ts` — maps lines through `checkContrast()`, `validateColors()`, `suggestForeground()`
- `src/batch/format-batch.ts` — human-readable, JSON, suggest formatters
- Tests for both modules

### CLI integration

Wire `--batch` into the argument parser and main flow:

- Extend `ParseResult` with `kind: 'batch'`
- Read stdin, parse lines, process batch, format output
- Set exit code based on aggregate results
- Integration tests with stdin piping
