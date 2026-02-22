/**
 * Convert a single HEX character (0-9, a-f, A-F) to its numeric value (0-15).
 * Returns NaN for invalid characters.
 */
export function hexCharToNumber(char: string): number {
  const code = char.charCodeAt(0);
  // 0-9
  if (code >= 48 && code <= 57) return code - 48;
  // a-f
  if (code >= 97 && code <= 102) return code - 87;
  // A-F
  if (code >= 65 && code <= 70) return code - 55;
  return NaN;
}

/**
 * Normalize an integer in the 0-255 range to a 0-1 floating point value.
 *
 * @precondition `value` must be an integer between 0 and 255 inclusive.
 * This cannot be enforced at the type level in TypeScript.
 * In the hex parsing pipeline, the regex validation in `parseHex`
 * guarantees that only valid hex characters reach this function.
 */
export function normalize8bit(value: number): number {
  return value / 255;
}
