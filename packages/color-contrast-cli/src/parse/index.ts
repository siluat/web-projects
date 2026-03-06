import type { ParsedColor } from '../types';
import { parseHex } from './hex';
import { parseHsl } from './hsl';
import { parseHwb } from './hwb';
import { parseLab } from './lab';
import { parseLch } from './lch';
import { parseNamedColor } from './named-colors';
import { parseOklab } from './oklab';
import { parseOklch } from './oklch';
import { parseRgb } from './rgb';

/**
 * Parse a CSS color string into a ParsedColor.
 *
 * Supports HEX formats (#RGB, #RRGGBB, #RGBA, #RRGGBBAA),
 * CSS named colors (red, navy, rebeccapurple, transparent, etc.),
 * RGB functional notation (rgb(), rgba()),
 * HSL functional notation (hsl(), hsla()),
 * HWB functional notation (hwb()),
 * LAB/LCH functional notation (lab(), lch()),
 * and OKLAB/OKLCH functional notation (oklab(), oklch()).
 * Returns null if the input cannot be parsed.
 */
export function parseColor(input: string): ParsedColor | null {
  const trimmed = input.trim();

  return (
    parseHex(trimmed) ??
    parseNamedColor(trimmed) ??
    parseRgb(trimmed) ??
    parseHsl(trimmed) ??
    parseHwb(trimmed) ??
    parseLab(trimmed) ??
    parseLch(trimmed) ??
    parseOklab(trimmed) ??
    parseOklch(trimmed)
  );
}
