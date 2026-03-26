# @siluat/color-contrast

WCAG color contrast computation library. Zero runtime dependencies, browser compatible.

## Implementation Guidelines

Before writing or modifying code, read and follow the principles in [docs/implementation-guidelines.md](docs/implementation-guidelines.md).

## Task Management

Work items are tracked in [docs/TASKS.md](docs/TASKS.md), not in external issue trackers.

## Architecture

- Pure computation: color parsing, color space conversion, contrast ratio, compliance grading, color suggestion
- No I/O, no CLI, no Node.js-specific APIs
- `@siluat/color-contrast-cli` depends on this package for all computation
