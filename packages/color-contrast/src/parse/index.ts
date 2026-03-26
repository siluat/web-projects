import type { ColorFormat, ParseDetail, ParsedColor } from '../types';
import { parseHex } from './hex';
import { parseHsl } from './hsl';
import { parseHwb } from './hwb';
import { parseLab } from './lab';
import { parseLch } from './lch';
import { parseNamedColor } from './named-colors';
import { parseOklab } from './oklab';
import { parseOklch } from './oklch';
import { parseRgb } from './rgb';

const PARSERS: {
  parse: (input: string) => ParsedColor | null;
  format: ColorFormat;
}[] = [
  { parse: parseHex, format: 'hex' },
  { parse: parseNamedColor, format: 'named' },
  { parse: parseRgb, format: 'rgb' },
  { parse: parseHsl, format: 'hsl' },
  { parse: parseHwb, format: 'hwb' },
  { parse: parseLab, format: 'lab' },
  { parse: parseLch, format: 'lch' },
  { parse: parseOklab, format: 'oklab' },
  { parse: parseOklch, format: 'oklch' },
];

/**
 * Parse a CSS color string into a ParsedColor with format metadata.
 *
 * Returns both the parsed color and the format it was detected as,
 * enabling verbose output to show what format was recognized.
 */
export function parseColorDetailed(input: string): ParseDetail | null {
  const trimmed = input.trim();
  for (const { parse, format } of PARSERS) {
    const parsed = parse(trimmed);
    if (parsed !== null) return { parsed, format };
  }
  return null;
}

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
  return parseColorDetailed(input)?.parsed ?? null;
}
