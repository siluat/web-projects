# Commit Convention

## Commit Message Format

```
<gitmoji> (<scope>): <subject>
```

- **MUST** use (<scope>) for changes specific to a single package.
- **MUST** use (repo) for changes to monorepo configuration, shared tooling, or cross-package infrastructure.
- **MUST NOT** use multiple scopes in a single commit.

### Examples

- `✨ (dotori-note): add search feature`
- `📝 (ui-craft): update README`
- `🔧 (repo): update monorepo configuration`
