import type { ParsedColor } from '../types';
import { parseHex } from './hex';
import { parseHsl } from './hsl';
import { parseHwb } from './hwb';
import { parseNamedColor } from './named-colors';
import { parseRgb } from './rgb';

/**
 * Parse a CSS color string into a ParsedColor.
 *
 * Supports HEX formats (#RGB, #RRGGBB, #RGBA, #RRGGBBAA),
 * CSS named colors (red, navy, rebeccapurple, transparent, etc.),
 * RGB functional notation (rgb(), rgba()),
 * HSL functional notation (hsl(), hsla()),
 * and HWB functional notation (hwb()).
 * Returns null if the input cannot be parsed.
 */
export function parseColor(input: string): ParsedColor | null {
  const trimmed = input.trim();

  return (
    parseHex(trimmed) ??
    parseNamedColor(trimmed) ??
    parseRgb(trimmed) ??
    parseHsl(trimmed) ??
    parseHwb(trimmed)
  );
}
