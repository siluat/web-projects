import type { ParsedColor } from '../types';
import { parseHex } from './hex';

/**
 * Parse a CSS color string into a ParsedColor.
 *
 * Currently supports HEX formats (#RGB, #RRGGBB, #RGBA, #RRGGBBAA).
 * Returns null if the input cannot be parsed.
 */
export function parseColor(input: string): ParsedColor | null {
  const trimmed = input.trim();

  return parseHex(trimmed);
}
