import type { HWBColor, SRGBColor } from '../types';
import { hslToSrgb } from './hsl-to-srgb';

/**
 * Convert an HWBColor to an SRGBColor.
 *
 * Follows CSS Color Level 4 Section 8.1:
 *   1. If white + black >= 1, short-circuit to achromatic gray = white / (white + black)
 *   2. Otherwise, compute the pure hue via HSL(h, 100%, 50%) and blend:
 *      value = hueRgb * (1 - white - black) + white
 *
 * @param color - HWBColor with h in [0, 1], w and b in [0, 1]
 * @returns SRGBColor with r, g, b in [0, 1]
 */
export function hwbToSrgb(color: HWBColor): SRGBColor {
  const white = color.w;
  const black = color.b;

  // Short-circuit: when w + b >= 1, the result is achromatic
  if (white + black >= 1) {
    const gray = white / (white + black);
    return { space: 'srgb', r: gray, g: gray, b: gray, alpha: color.alpha };
  }

  // Compute the pure hue color at full saturation and 50% lightness
  const hueRgb = hslToSrgb({
    space: 'hsl',
    h: color.h,
    s: 1,
    l: 0.5,
    alpha: 1,
  });

  const scale = 1 - white - black;
  return {
    space: 'srgb',
    r: hueRgb.r * scale + white,
    g: hueRgb.g * scale + white,
    b: hueRgb.b * scale + white,
    alpha: color.alpha,
  };
}
