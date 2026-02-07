import { NAMED_COLORS } from './named-colors.js';
import type { RGB } from './types.js';

interface ColorFormat {
  pattern: RegExp;
  toRgb: (match: RegExpMatchArray) => RGB;
}

function group(m: RegExpMatchArray, i: number): string {
  return m[i] as string;
}

const COLOR_FORMATS: ColorFormat[] = [
  {
    // #RGB
    pattern: /^#([0-9a-f])([0-9a-f])([0-9a-f])$/,
    toRgb: (m) => ({
      r: Number.parseInt(group(m, 1) + group(m, 1), 16),
      g: Number.parseInt(group(m, 2) + group(m, 2), 16),
      b: Number.parseInt(group(m, 3) + group(m, 3), 16),
    }),
  },
  {
    // #RGBA
    pattern: /^#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])$/,
    toRgb: (m) => ({
      r: Number.parseInt(group(m, 1) + group(m, 1), 16),
      g: Number.parseInt(group(m, 2) + group(m, 2), 16),
      b: Number.parseInt(group(m, 3) + group(m, 3), 16),
      a: Number.parseInt(group(m, 4) + group(m, 4), 16) / 255,
    }),
  },
  {
    // #RRGGBB
    pattern: /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/,
    toRgb: (m) => ({
      r: Number.parseInt(group(m, 1), 16),
      g: Number.parseInt(group(m, 2), 16),
      b: Number.parseInt(group(m, 3), 16),
    }),
  },
  {
    // #RRGGBBAA
    pattern: /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/,
    toRgb: (m) => ({
      r: Number.parseInt(group(m, 1), 16),
      g: Number.parseInt(group(m, 2), 16),
      b: Number.parseInt(group(m, 3), 16),
      a: Number.parseInt(group(m, 4), 16) / 255,
    }),
  },
  {
    // rgb(r, g, b)
    pattern: /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/,
    toRgb: (m) => ({
      r: Number.parseInt(group(m, 1), 10),
      g: Number.parseInt(group(m, 2), 10),
      b: Number.parseInt(group(m, 3), 10),
    }),
  },
  {
    // rgba(r, g, b, a)
    pattern: /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9.]+)\s*\)$/,
    toRgb: (m) => ({
      r: Number.parseInt(group(m, 1), 10),
      g: Number.parseInt(group(m, 2), 10),
      b: Number.parseInt(group(m, 3), 10),
      a: Number.parseFloat(group(m, 4)),
    }),
  },
];

export function parseColor(input: string): RGB {
  const key = input.trim().toLowerCase();
  const named = NAMED_COLORS[key];
  if (named) return named;
  for (const { pattern, toRgb } of COLOR_FORMATS) {
    const match = key.match(pattern);
    if (match) return toRgb(match);
  }
  throw new Error(`Unsupported color format: "${input}"`);
}
