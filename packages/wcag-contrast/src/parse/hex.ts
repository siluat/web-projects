import type { SRGBColor } from '../types';
import { hexCharToNumber, normalize8bit } from './utils';

type Channels = [r: number, g: number, b: number, a: number];

/** Expand a single hex digit: 0x5 -> 0x55 */
function hex1(s: string, i: number): number {
  return hexCharToNumber(s.charAt(i)) * 17;
}

/** Parse two hex digits: 0x5A -> 90 */
function hex2(s: string, i: number): number {
  return hexCharToNumber(s.charAt(i)) * 16 + hexCharToNumber(s.charAt(i + 1));
}

/**
 * HEX format pattern definitions.
 * Each pattern describes the digit length (excluding '#') and how to extract
 * RGBA channel values (0-255) from the hex string.
 */
interface HexFormat {
  length: number;
  channels: (hex: string) => Channels;
}

const formats: HexFormat[] = [
  { length: 3, channels: (s) => [hex1(s, 0), hex1(s, 1), hex1(s, 2), 255] },
  {
    length: 4,
    channels: (s) => [hex1(s, 0), hex1(s, 1), hex1(s, 2), hex1(s, 3)],
  },
  { length: 6, channels: (s) => [hex2(s, 0), hex2(s, 2), hex2(s, 4), 255] },
  {
    length: 8,
    channels: (s) => [hex2(s, 0), hex2(s, 2), hex2(s, 4), hex2(s, 6)],
  },
];

const HEX_PATTERN = /^#[0-9a-fA-F]+$/;

/**
 * Parse a HEX color string into an SRGBColor.
 *
 * Supported formats: #RGB, #RRGGBB, #RGBA, #RRGGBBAA
 * Case-insensitive. Returns null for invalid input.
 */
export function parseHex(input: string): SRGBColor | null {
  if (!HEX_PATTERN.test(input)) return null;

  const hex = input.slice(1);
  const format = formats.find((f) => f.length === hex.length);
  if (!format) return null;

  const [r, g, b, a] = format.channels(hex);
  return {
    space: 'srgb',
    r: normalize8bit(r),
    g: normalize8bit(g),
    b: normalize8bit(b),
    alpha: normalize8bit(a),
  };
}
