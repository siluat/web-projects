import type { RGB } from '../types';

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Parse hue value with unit support (deg, rad, grad, turn)
 */
function parseHue(value: string): number {
  const trimmed = value.trim().toLowerCase();

  let degrees: number;

  if (trimmed.endsWith('turn')) {
    degrees = Number.parseFloat(trimmed) * 360;
  } else if (trimmed.endsWith('grad')) {
    // Check grad before rad since 'grad' ends with 'rad'
    degrees = Number.parseFloat(trimmed) * 0.9;
  } else if (trimmed.endsWith('rad')) {
    degrees = Number.parseFloat(trimmed) * (180 / Math.PI);
  } else {
    // deg or no unit
    degrees = Number.parseFloat(trimmed);
  }

  if (Number.isNaN(degrees)) {
    return Number.NaN;
  }

  // Normalize to 0-360
  return ((degrees % 360) + 360) % 360;
}

/**
 * Parse percentage value (0-100)
 */
function parsePercentage(value: string): number {
  const trimmed = value.trim();
  if (!trimmed.endsWith('%')) {
    return Number.NaN;
  }

  const num = Number.parseFloat(trimmed);
  if (Number.isNaN(num)) {
    return Number.NaN;
  }

  return clamp(num, 0, 100);
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
 * Convert HSL to RGB
 * h: 0-360, s: 0-100, l: 0-100
 */
function hslToRgb(
  h: number,
  s: number,
  l: number,
): { r: number; g: number; b: number } {
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/**
 * Parse HSL/HSLA color string to RGB
 * Supports:
 * - hsl(180, 50%, 50%), hsla(180, 50%, 50%, 0.5)
 * - hsl(180 50% 50%), hsl(180 50% 50% / 0.5)
 * - hsl(180deg 50% 50%), hsl(0.5turn 50% 50%)
 */
export function parseHsl(color: string): RGB | null {
  const trimmed = color.trim().toLowerCase();

  // Match hsl( or hsla(
  const match = trimmed.match(/^hsla?\s*\(\s*(.+)\s*\)$/);
  if (!match) {
    return null;
  }

  const content = match[1];
  if (!content) {
    return null;
  }

  // Check for slash syntax (modern): hsl(180 50% 50% / 0.5)
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

  // For comma syntax with alpha: hsla(180, 50%, 50%, 0.5)
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

  const [v0, v1, v2] = values;
  if (!v0 || !v1 || !v2) {
    return null;
  }

  const h = parseHue(v0);
  const s = parsePercentage(v1);
  const l = parsePercentage(v2);

  if (Number.isNaN(h) || Number.isNaN(s) || Number.isNaN(l)) {
    return null;
  }

  const rgb = hslToRgb(h, s, l);

  if (alpha !== undefined) {
    return { ...rgb, a: alpha };
  }

  return rgb;
}
