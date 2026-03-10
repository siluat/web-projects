import type { OKLCHColor, SRGBColor } from '../types';
import { linearRgbToXyz } from './linear-rgb-to-xyz';
import { oklabToOklch } from './oklab-to-oklch';
import { srgbToLinear } from './srgb-linear';
import { xyzToOklab } from './xyz-to-oklab';

/**
 * Convert a gamma-encoded sRGB color to OkLCH.
 *
 * 4-stage pipeline:
 *   sRGB → linear sRGB → XYZ-D65 → OKLAB → OKLCH
 *
 * Alpha is preserved through the chain.
 *
 * @see https://www.w3.org/TR/css-color-4/#ok-lab
 */
export function srgbToOklch(color: SRGBColor): OKLCHColor {
  const linear = srgbToLinear(color);
  const xyz = linearRgbToXyz(linear);
  const oklab = xyzToOklab(xyz, color.alpha);
  return oklabToOklch(oklab);
}
