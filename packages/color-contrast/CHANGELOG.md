# @siluat/color-contrast

## 1.0.0

### Major Changes

- [#110](https://github.com/siluat/web-projects/pull/110) [`9712661`](https://github.com/siluat/web-projects/commit/9712661b95a486a5b1b9a3252bcec7396f1b47a6) - Split computation engine into standalone `@siluat/color-contrast` library

  **@siluat/color-contrast (new)**

  - Extract pure computation code: color parsing, conversion, contrast ratio, compliance grading, color suggestion
  - Zero runtime dependencies, browser compatible
  - Export `parseColor`, `parseHex`, `srgbToOklch` for advanced use cases

  **@siluat/color-contrast-cli**

  - Refactor to use `@siluat/color-contrast` as computation engine
  - CLI now owns only batch processing, output formatting, and argument parsing
  - Public API unchanged: all existing imports continue to work via re-exports
