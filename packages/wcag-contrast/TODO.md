# TODO

## Guideline Updates

- [ ] Clarify guideline #3 "No escape hatches" to distinguish between `as` at call sites (forbidden) and `as` inside factory functions (permitted). Factory-internal `as` narrows types rather than bypassing them, similar to `as const`. This enables patterns like branded types where `as` is encapsulated in a single factory function and consumers never write `as` themselves.
