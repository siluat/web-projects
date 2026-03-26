import type { LABColor, LCHColor } from '../types';

/**
 * Convert an LCHColor (polar) to a LABColor (cartesian).
 *
 * LCH is the polar representation of LAB where:
 *   a = C * cos(H), b = C * sin(H)
 *
 * @see https://www.w3.org/TR/css-color-4/#lch-to-lab
 */

const DEG_TO_RAD = Math.PI / 180;

export function lchToLab(color: LCHColor): LABColor {
  const hRad = color.h * DEG_TO_RAD;
  return {
    space: 'lab',
    l: color.l,
    a: color.c * Math.cos(hRad),
    b: color.c * Math.sin(hRad),
    alpha: color.alpha,
  };
}
