# Commit Convention

## Commit Message Format

```
<gitmoji> (<scope>): <subject>
```

- **MUST** use (<scope>) for changes specific to a single package.
- **MUST** use (global) for changes that do not belong to any specific package.
- **MUST NOT** use multiple scopes in a single commit.

### Examples

- `✨ (dotori-note): add search feature`
- `📝 (ui-craft): update README`
- `🔧 (global): update monorepo configuration`
