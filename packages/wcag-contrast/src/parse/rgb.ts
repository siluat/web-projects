import type { RGB } from '../types';

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Parse a color value that may be a number or percentage
 */
function parseColorValue(value: string, isPercentage: boolean): number {
  const num = Number.parseFloat(value);
  if (Number.isNaN(num)) {
    return Number.NaN;
  }

  if (isPercentage) {
    return clamp(Math.round((num / 100) * 255), 0, 255);
  }

  return clamp(Math.round(num), 0, 255);
}

/**
 * Parse alpha value (0-1 or percentage)
 */
function parseAlpha(value: string): number {
  const trimmed = value.trim();
  const isPercentage = trimmed.endsWith('%');
  const num = Number.parseFloat(trimmed);

  if (Number.isNaN(num)) {
    return Number.NaN;
  }

  if (isPercentage) {
    return clamp(num / 100, 0, 1);
  }

  return clamp(num, 0, 1);
}

/**
 * Parse RGB/RGBA color string to RGB
 * Supports:
 * - rgb(255, 128, 0), rgba(255, 128, 0, 0.5)
 * - rgb(255 128 0), rgb(255 128 0 / 0.5)
 * - rgb(100%, 50%, 0%)
 */
export function parseRgb(color: string): RGB | null {
  const trimmed = color.trim().toLowerCase();

  // Match rgb( or rgba(
  const match = trimmed.match(/^rgba?\s*\(\s*(.+)\s*\)$/);
  if (!match) {
    return null;
  }

  const content = match[1];
  if (!content) {
    return null;
  }

  // Check for slash syntax (modern): rgb(255 128 0 / 0.5)
  const slashParts = content.trim().split('/');
  const firstPart = slashParts[0];
  if (!firstPart) {
    return null;
  }
  const colorPart = firstPart.trim();
  const alphaPart = slashParts[1]?.trim();

  // Determine separator: comma or space
  const hasComma = colorPart.includes(',');
  const values = hasComma
    ? colorPart.split(',').map((v) => v.trim())
    : colorPart.split(/\s+/).filter((v) => v.length > 0);

  // For comma syntax with alpha: rgba(255, 128, 0, 0.5)
  let alpha: number | undefined;
  if (hasComma && values.length === 4 && !alphaPart) {
    const alphaStr = values.pop();
    if (alphaStr) {
      alpha = parseAlpha(alphaStr);
      if (Number.isNaN(alpha)) {
        return null;
      }
    }
  } else if (alphaPart) {
    alpha = parseAlpha(alphaPart);
    if (Number.isNaN(alpha)) {
      return null;
    }
  }

  if (values.length !== 3) {
    return null;
  }

  // Check if using percentage
  const usePercentage = values.some((v) => v.endsWith('%'));

  // All values should be consistent (all percentage or all numbers)
  const allPercentage = values.every((v) => v.endsWith('%'));
  const allNumber = values.every((v) => !v.endsWith('%'));

  if (!allPercentage && !allNumber) {
    return null;
  }

  const [v0, v1, v2] = values;
  if (!v0 || !v1 || !v2) {
    return null;
  }

  const r = parseColorValue(v0, usePercentage);
  const g = parseColorValue(v1, usePercentage);
  const b = parseColorValue(v2, usePercentage);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return null;
  }

  if (alpha !== undefined) {
    return { r, g, b, a: alpha };
  }

  return { r, g, b };
}
