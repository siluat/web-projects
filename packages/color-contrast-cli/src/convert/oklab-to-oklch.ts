import type { OKLABColor, OKLCHColor } from '../types';

/**
 * Convert an OKLABColor (cartesian) to an OKLCHColor (polar).
 *
 * Inverse of `oklchToOklab`:
 *   C = hypot(a, b)
 *   H = atan2(b, a) in degrees, wrapped to [0, 360)
 *
 * @see https://www.w3.org/TR/css-color-4/#lab-to-lch
 */

const RAD_TO_DEG = 180 / Math.PI;

export function oklabToOklch(color: OKLABColor): OKLCHColor {
  const c = Math.hypot(color.a, color.b);
  let h = Math.atan2(color.b, color.a) * RAD_TO_DEG;
  if (h < 0) h += 360;

  return {
    space: 'oklch',
    l: color.l,
    c,
    h,
    alpha: color.alpha,
  };
}
