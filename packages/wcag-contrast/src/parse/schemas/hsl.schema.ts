import type { RGB } from '../../types';
import { parseHue, parsePercentageClamped } from '../core/parsers';
import type { FunctionalColorSchema } from '../core/types';

/**
 * Convert HSL to RGB
 * h: 0-360, s: 0-100, l: 0-100
 */
function hslToRgb(
  h: number,
  s: number,
  l: number,
): { r: number; g: number; b: number } {
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/**
 * HSL color schema for functional color parsing
 */
export const hslSchema: FunctionalColorSchema<'h' | 's' | 'l'> = {
  functionNames: ['hsl', 'hsla'],
  channelOrder: ['h', 's', 'l'],
  channels: {
    h: { name: 'hue', parser: parseHue },
    s: { name: 'saturation', parser: parsePercentageClamped },
    l: { name: 'lightness', parser: parsePercentageClamped },
  },
  toRgb: (values, alpha): RGB => {
    const rgb = hslToRgb(values.h, values.s, values.l);
    if (alpha !== undefined) {
      return { ...rgb, a: alpha };
    }
    return rgb;
  },
};
