import type { ParsedColor } from '../types';
import { parseHex } from './hex';
import { parseNamedColor } from './named-colors';

/**
 * Parse a CSS color string into a ParsedColor.
 *
 * Supports HEX formats (#RGB, #RRGGBB, #RGBA, #RRGGBBAA)
 * and CSS named colors (red, navy, rebeccapurple, transparent, etc.).
 * Returns null if the input cannot be parsed.
 */
export function parseColor(input: string): ParsedColor | null {
  const trimmed = input.trim();

  return parseHex(trimmed) ?? parseNamedColor(trimmed);
}
