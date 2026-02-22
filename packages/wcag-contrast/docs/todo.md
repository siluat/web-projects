# TODO

## HEX Parser

### 1. Assumption About `normalize8bit` Input Range

**Location:** `utils.ts:20`

The name implies an 8-bit value, but the function accepts any number. If `hexCharToNumber` returns `-1`, `hex1` becomes `-17` and `hex2` becomes `-16 + x`, causing `normalize8bit` to return a negative result. Since this cannot be guaranteed at the type level, at minimum the precondition should be documented in a JSDoc comment.

### 2. Regex Length Restriction

**Location:** `hex.ts:41`

`/^#[0-9a-fA-F]+$/` does not validate length, so inputs like `#f` or `#fffffffff` pass the regex. They are filtered out later by `formats.find`, but restricting length in the regex itself (`/^#[0-9a-fA-F]{3,8}$/`) would eliminate unnecessary computation. The difference is negligible, so this is a matter of preference.
