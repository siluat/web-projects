import type { ParseResult, ValueParser } from './types';

/**
 * Centralized regex patterns for color value parsing
 */
export const PATTERNS = {
  /** Matches numeric values: -123, 45.67, .5 */
  numeric: /^-?\d+(\.\d+)?$/,
  /** Matches percentage values: 50%, -10.5% */
  percentage: /^-?\d+(\.\d+)?%$/,
  /** Matches alpha values (number or percentage): 0.5, 50% */
  alpha: /^-?\d+(\.\d+)?%?$/,
  /** Matches hue values with optional unit: 180, 180deg, 0.5turn, 3.14rad, 200grad */
  hue: /^-?\d+(\.\d+)?(deg|rad|grad|turn)?$/,
} as const;

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Create a successful parse result
 */
export function ok<T>(value: T): ParseResult<T> {
  return { ok: true, value };
}

/**
 * Create a failed parse result
 */
export function fail<T>(): ParseResult<T> {
  return { ok: false };
}

/**
 * Parse a numeric value (no unit)
 */
export const parseNumeric: ValueParser<number> = (value: string) => {
  const trimmed = value.trim();
  if (!PATTERNS.numeric.test(trimmed)) {
    return fail();
  }
  const num = Number.parseFloat(trimmed);
  if (Number.isNaN(num)) {
    return fail();
  }
  return ok(num);
};

/**
 * Parse a percentage value and return 0-100
 */
export const parsePercentage: ValueParser<number> = (value: string) => {
  const trimmed = value.trim();
  if (!PATTERNS.percentage.test(trimmed)) {
    return fail();
  }
  const num = Number.parseFloat(trimmed);
  if (Number.isNaN(num)) {
    return fail();
  }
  return ok(num);
};

/**
 * Parse a percentage value and clamp to 0-100
 */
export const parsePercentageClamped: ValueParser<number> = (value: string) => {
  const result = parsePercentage(value);
  if (!result.ok) {
    return result;
  }
  return ok(clamp(result.value, 0, 100));
};

/**
 * Parse alpha value (0-1 or percentage), clamped to 0-1
 */
export const parseAlpha: ValueParser<number> = (value: string) => {
  const trimmed = value.trim();

  if (!PATTERNS.alpha.test(trimmed)) {
    return fail();
  }

  const isPercentage = trimmed.endsWith('%');
  const num = Number.parseFloat(trimmed);

  if (Number.isNaN(num)) {
    return fail();
  }

  if (isPercentage) {
    return ok(clamp(num / 100, 0, 1));
  }

  return ok(clamp(num, 0, 1));
};

/**
 * Parse hue value with unit support (deg, rad, grad, turn)
 * Returns normalized degrees (0-360)
 */
export const parseHue: ValueParser<number> = (value: string) => {
  const trimmed = value.trim().toLowerCase();

  if (!PATTERNS.hue.test(trimmed)) {
    return fail();
  }

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
    return fail();
  }

  // Normalize to 0-360
  return ok(((degrees % 360) + 360) % 360);
};

/**
 * Create an RGB channel parser (for numeric or percentage format)
 * Returns value in 0-255 range
 */
export function createRgbChannelParser(
  isPercentage: boolean,
): ValueParser<number> {
  return (value: string) => {
    const trimmed = value.trim();

    if (isPercentage) {
      if (!PATTERNS.percentage.test(trimmed)) {
        return fail();
      }
    } else {
      if (!PATTERNS.numeric.test(trimmed)) {
        return fail();
      }
    }

    const num = Number.parseFloat(trimmed);
    if (Number.isNaN(num)) {
      return fail();
    }

    if (isPercentage) {
      return ok(clamp(Math.round((num / 100) * 255), 0, 255));
    }

    return ok(clamp(Math.round(num), 0, 255));
  };
}
