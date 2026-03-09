# @siluat/color-contrast-cli

## 0.6.0

### Minor Changes

- [#91](https://github.com/siluat/web-projects/pull/91) [`20baf0c`](https://github.com/siluat/web-projects/commit/20baf0c875d8c6eefdb2a90f8b7af9a8ba5a3fed) - Add actionable error messages with format-specific hints for invalid color inputs and argument count errors

- [#89](https://github.com/siluat/web-projects/pull/89) [`0832068`](https://github.com/siluat/web-projects/commit/0832068089947af0509aaddc84342e1536d87374) - Add `--size normal|large` option for large text WCAG threshold checks

- [#92](https://github.com/siluat/web-projects/pull/92) [`48772bc`](https://github.com/siluat/web-projects/commit/48772bce4e6a37e307b134b2fdb06a0447d8ba78) - Add `validateColors` function that checks both foreground and background colors upfront and reports all errors at once, instead of failing on the first invalid color

- [#95](https://github.com/siluat/web-projects/pull/95) [`267cf3d`](https://github.com/siluat/web-projects/commit/267cf3dbcdad9683cc43ad99bfa273a687c1d9ea) - Add `--verbose` flag that shows the full color conversion pipeline trace: format detection, parsed values, sRGB conversion, alpha compositing, luminance, and contrast evaluation

## 0.5.0

### Minor Changes

- [#84](https://github.com/siluat/web-projects/pull/84) [`49693e2`](https://github.com/siluat/web-projects/commit/49693e2ca7d4b73d875f73f54cddfd98c93cab4d) - Add `--help` and `--version` flags to the CLI

- [#86](https://github.com/siluat/web-projects/pull/86) [`23ce19b`](https://github.com/siluat/web-projects/commit/23ce19b379a77f85570afa1c8571b86aba16d0b3) - Allow `--level` and `--json` flags to be used together

## 0.4.0

### Minor Changes

- [`5c3bba8`](https://github.com/siluat/web-projects/commit/5c3bba838407c0ed05d396a2860b3a697b96a74a) - Rename CLI command from `contrast` to `ccr` (Color Contrast Ratio)

## 0.3.0

### Minor Changes

- [#79](https://github.com/siluat/web-projects/pull/79) [`7af35da`](https://github.com/siluat/web-projects/commit/7af35dae704869a5dbbd01f73aa99155ec7c387a) - Add wide-gamut color conversion pipeline (LCH, OKLCH, LAB, OKLAB → XYZ-D65 → linear sRGB) per CSS Color Level 4 Sections 10.1–10.3

- [`8cf1d27`](https://github.com/siluat/web-projects/commit/8cf1d27a427e20a127720403f2bfe9c8596eedf4) - Add LAB, LCH, OKLAB, OKLCH color format parsers per CSS Color Level 4 Sections 10.1 and 10.3

### Patch Changes

- [#81](https://github.com/siluat/web-projects/pull/81) [`cfab92c`](https://github.com/siluat/web-projects/commit/cfab92cb59659cb377b24bf042b58745f7fa9903) - Add CSS Color Level 4 Section 13.2 gamut mapping algorithm for mapping wide-gamut colors into sRGB via chroma binary search in OKLCH

## 0.2.0

### Minor Changes

- [#76](https://github.com/siluat/web-projects/pull/76) [`e70c3b6`](https://github.com/siluat/web-projects/commit/e70c3b612b57db2e211f5d9ca9b035059069d190) - Add HSL/HSLA parser and HSL-to-sRGB conversion supporting angle units (deg, rad, grad, turn) and both comma and space syntax

- [#77](https://github.com/siluat/web-projects/pull/77) [`730f7da`](https://github.com/siluat/web-projects/commit/730f7dab4a21495b4e2540001a7caba9a2dfd0bb) - Add HWB parser and HWB-to-sRGB conversion supporting angle units (deg, rad, grad, turn) and w+b normalization per CSS Color Level 4 Section 8

- [#73](https://github.com/siluat/web-projects/pull/73) [`5a9ce46`](https://github.com/siluat/web-projects/commit/5a9ce46594b413ddf203e036bfdd440e13d0ab8d) - Add CSS named colors parser supporting 148 named colors and transparent

- [#75](https://github.com/siluat/web-projects/pull/75) [`6e6e1b3`](https://github.com/siluat/web-projects/commit/6e6e1b352caa959e7b79edb78ca2cfee29b629bd) - Add RGB functional notation parser supporting rgb() and rgba() with comma and space syntax
