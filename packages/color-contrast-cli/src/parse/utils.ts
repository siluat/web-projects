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

/** Clamp a number to the inclusive range [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Normalize an RGB channel value (0-255) to 0-1.
 * Clamps out-of-range values before normalizing.
 */
export function normalizeRgbChannel(value: number): number {
  return clamp(value, 0, 255) / 255;
}

/**
 * Normalize a percentage value (0-100) to 0-1.
 * Clamps out-of-range values before normalizing.
 */
export function normalizePercentage(value: number): number {
  return clamp(value, 0, 100) / 100;
}

/**
 * Normalize an alpha value to the 0-1 range.
 * Clamps out-of-range values.
 */
export function normalizeAlpha(value: number): number {
  return clamp(value, 0, 1);
}
