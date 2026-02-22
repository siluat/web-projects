# 005: HEX Regex Length Strategy

## Status

Accepted

## Context

The HEX parser's regex `/^#[0-9a-fA-F]+$/` does not validate length, so inputs like `#f` or `#fffffffff` pass the regex and reach `formats.find`, which then rejects them by length mismatch. Restricting length in the regex itself would eliminate this unnecessary computation.

Two approaches were considered:

1. **Range restriction `{3,8}`** — covers all valid lengths (3, 4, 6, 8) while also admitting lengths 5 and 7
2. **Exact alternation `{3}|{4}|{6}|{8}`** — matches only valid lengths precisely

## Decision

**Use `{3,8}` range restriction in the regex, and delegate exact length validation to `formats.find`.**

### Rationale

1. **No logic duplication:** An exact alternation (`{3}|{4}|{6}|{8}`) would replicate the length knowledge already encoded in the `formats` array. With `{3,8}`, the regex handles character validation and the `formats` array remains the single source of truth for valid lengths.

2. **Effective filtering:** `{3,8}` eliminates extreme inputs (1-2 characters, 9+ characters) at the regex stage, which is where the performance benefit matters.

3. **Negligible cost of false positives:** Lengths 5 and 7 pass the regex but are rejected by `formats.find`, which iterates over a 4-element array — a trivial cost.

### Rejected Alternative

`/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/` — precise but duplicates the length logic already maintained in the `formats` array, increasing maintenance burden when formats change.

## References

- `packages/wcag-contrast/src/parse/hex.ts` — HEX parser implementation
