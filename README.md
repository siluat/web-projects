# web-projects

[![codecov](https://codecov.io/gh/siluat/web-projects/graph/badge.svg?token=ML9T466TEB)](https://codecov.io/gh/siluat/web-projects)

Collection of my personal web projects.

## Projects

### Web Applications

| App | Description |
|-----|-------------|
| [dotori-note](./apps/dotori-note/) | Personal blog for recording and sharing various things. |
| [noumenon-front](./apps/noumenon-front/) | Final Fantasy XIV data search service (early development). |

### Libraries

| Package | Description | Coverage |
|---------|-------------|----------|
| [@siluat/ui-craft](./packages/ui-craft/) | My personal UI animation crafting practice. | [![codecov][ui-craft-badge]][codecov] |
| [@siluat/color-contrast-cli](./packages/color-contrast-cli/) | WCAG 2.1 contrast ratio checker CLI. | [![codecov][cli-badge]][codecov] |
| [@siluat/shadcn-ui](./packages/shadcn-ui/) | shadcn/ui components. | |
| [@siluat/typescript-config](./packages/typescript-config/) | Shared TypeScript configurations. | |
| [noumenon-gleaner](./packages/noumenon-gleaner/) | Data extraction tool for Noumenon project (Rust CLI). | |
| [noumenon-librarian](./packages/noumenon-librarian/) | Data pipeline orchestrator for Noumenon project. | |

[codecov]: https://codecov.io/gh/siluat/web-projects
[ui-craft-badge]: https://codecov.io/gh/siluat/web-projects/graph/badge.svg?token=ML9T466TEB&component=ui-craft
[cli-badge]: https://codecov.io/gh/siluat/web-projects/graph/badge.svg?token=ML9T466TEB&component=color-contrast-cli

### Playgrounds

> For local development and testing purposes only

| Playground | Description |
|------------|-------------|
| [ui-craft-playground](./playgrounds/ui-craft-playground/) | Playground for UI Craft components. |
| [noumenon-gleaner-runner](./playgrounds/noumenon-gleaner-runner/) | Package to verify that Noumenon Gleaner runs correctly via npm scripts. |

## Guides

### Generate a new package

Generate a package of that type by entering the following command and selecting the package type.

```bash
turbo gen package
```
