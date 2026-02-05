import type { RGB } from '../types';
import { parseHex } from './hex';
import { parseHsl } from './hsl';
import { parseNamed } from './named';
import { parseRgb } from './rgb';

export { parseHex } from './hex';
export { parseHsl } from './hsl';
export { parseNamed } from './named';
export { parseRgb } from './rgb';

/**
 * Parse any CSS color string to RGB
 * Supports: HEX, RGB, HSL, and named colors
 * Returns null if the color string cannot be parsed
 */
export function parseColor(color: string): RGB | null {
  if (!color || typeof color !== 'string') {
    return null;
  }

  const trimmed = color.trim();
  if (!trimmed) {
    return null;
  }

  // Try parsers in order: hex → rgb → hsl → named
  return (
    parseHex(trimmed) ??
    parseRgb(trimmed) ??
    parseHsl(trimmed) ??
    parseNamed(trimmed)
  );
}
