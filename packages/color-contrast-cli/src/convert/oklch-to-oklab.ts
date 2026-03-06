import type { OKLABColor, OKLCHColor } from '../types';

/**
 * Convert an OKLCHColor (polar) to an OKLABColor (cartesian).
 *
 * Same polar-to-cartesian formula as LCH → LAB:
 *   a = C * cos(H), b = C * sin(H)
 *
 * @see https://www.w3.org/TR/css-color-4/#lch-to-lab
 */

const DEG_TO_RAD = Math.PI / 180;

export function oklchToOklab(color: OKLCHColor): OKLABColor {
  const hRad = color.h * DEG_TO_RAD;
  return {
    space: 'oklab',
    l: color.l,
    a: color.c * Math.cos(hRad),
    b: color.c * Math.sin(hRad),
    alpha: color.alpha,
  };
}
