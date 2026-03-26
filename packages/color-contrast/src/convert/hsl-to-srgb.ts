import type { HSLColor, SRGBColor } from '../types';

/**
 * Convert an HSLColor to an SRGBColor.
 *
 * Uses the direct formula from CSS Color Level 4 Section 7:
 *   f(n) = L - a * max(-1, min(k - 3, 9 - k, 1))
 *   where k = (n + H*360/30) % 12, a = S * min(L, 1-L)
 *
 * @param color - HSLColor with h, s, l in [0, 1]
 * @returns SRGBColor with r, g, b in [0, 1]
 */
export function hslToSrgb(color: HSLColor): SRGBColor {
  const hue = color.h * 360;
  const sat = color.s;
  const light = color.l;

  const a = sat * Math.min(light, 1 - light);

  function f(n: number): number {
    const k = (n + hue / 30) % 12;
    return light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  }

  return {
    space: 'srgb',
    r: f(0),
    g: f(8),
    b: f(4),
    alpha: color.alpha,
  };
}
