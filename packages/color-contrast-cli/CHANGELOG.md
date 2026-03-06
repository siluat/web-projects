# @siluat/color-contrast-cli

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
