# TODO

## HEX Parser

### 1. Regex Length Restriction

**Location:** `hex.ts:41`

`/^#[0-9a-fA-F]+$/` does not validate length, so inputs like `#f` or `#fffffffff` pass the regex. They are filtered out later by `formats.find`, but restricting length in the regex itself (`/^#[0-9a-fA-F]{3,8}$/`) would eliminate unnecessary computation. The difference is negligible, so this is a matter of preference.
