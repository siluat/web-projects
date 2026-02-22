# TODO

## HEX Parser

### 1. Missing `-1` Return Handling in `hexCharToNumber`

**Location:** `utils.ts:13`, `hex.ts:8,13`

The `HEX_PATTERN` regex pre-validates input, so `-1` never occurs in the current execution path. However, `hexCharToNumber` is an independently exported function. If called directly elsewhere, an invalid value (`-1`) can propagate silently.

**Options:**

- Keep `hexCharToNumber` unexported and limit it to module-internal use
- Return `NaN` for invalid characters so the result propagates as `NaN`, making debugging easier

### 2. Assumption About `normalize8bit` Input Range

**Location:** `utils.ts:20`

The name implies an 8-bit value, but the function accepts any number. If `hexCharToNumber` returns `-1`, `hex1` becomes `-17` and `hex2` becomes `-16 + x`, causing `normalize8bit` to return a negative result. Since this cannot be guaranteed at the type level, at minimum the precondition should be documented in a JSDoc comment.

### 3. Regex Length Restriction

**Location:** `hex.ts:41`

`/^#[0-9a-fA-F]+$/` does not validate length, so inputs like `#f` or `#fffffffff` pass the regex. They are filtered out later by `formats.find`, but restricting length in the regex itself (`/^#[0-9a-fA-F]{3,8}$/`) would eliminate unnecessary computation. The difference is negligible, so this is a matter of preference.
