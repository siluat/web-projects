import { alphaComposite } from './alpha-composite';
import { computeContrastRatio, evaluateContrast } from './contrast';
import { srgbToLinear } from './convert/srgb-linear';
import { relativeLuminance } from './luminance';
import { parseColor } from './parse';
import type { ContrastResult, SRGBColor } from './types';

export type { ComplianceLevel, ContrastResult } from './types';

/**
 * Parse a color string or throw a descriptive error.
 *
 * Currently only sRGB hex strings are supported. When additional
 * parsers (HSL, HWB, etc.) are added, this function will serve
 * as the dispatch point for color space conversion.
 */
function parseOrThrow(input: string): SRGBColor {
  const parsed = parseColor(input);
  if (parsed === null) {
    throw new Error(`Invalid color: "${input}"`);
  }
  if (parsed.space !== 'srgb') {
    throw new Error(`Unsupported color space: "${parsed.space}"`);
  }
  return parsed;
}

/**
 * Convert a foreground/background sRGB pair to their relative luminances.
 *
 * Pipeline: alpha composite -> gamma decode -> luminance
 */
function colorToLuminance(fg: SRGBColor, bg: SRGBColor): [number, number] {
  const [fgOpaque, bgOpaque] = alphaComposite(fg, bg);
  return [
    relativeLuminance(srgbToLinear(fgOpaque)),
    relativeLuminance(srgbToLinear(bgOpaque)),
  ];
}

/**
 * Calculate the WCAG 2.1 contrast ratio between two CSS colors.
 *
 * Accepts any supported color format (currently hex).
 * Handles alpha compositing automatically.
 *
 * @returns Contrast ratio rounded to two decimal places (range 1–21)
 */
export function contrastRatio(foreground: string, background: string): number {
  const fg = parseOrThrow(foreground);
  const bg = parseOrThrow(background);
  const [fgLum, bgLum] = colorToLuminance(fg, bg);
  return computeContrastRatio(fgLum, bgLum);
}

/**
 * Evaluate WCAG 2.1 contrast compliance between two CSS colors.
 *
 * Returns the contrast ratio and compliance levels for normal text
 * (AA >= 4.5, AAA >= 7) and large text (AA >= 3, AAA >= 4.5).
 */
export function checkContrast(
  foreground: string,
  background: string,
): ContrastResult {
  const fg = parseOrThrow(foreground);
  const bg = parseOrThrow(background);
  const [fgLum, bgLum] = colorToLuminance(fg, bg);
  return evaluateContrast(fgLum, bgLum);
}
