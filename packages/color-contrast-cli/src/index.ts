import { alphaComposite } from './alpha-composite';
import { computeContrastRatio, evaluateContrast } from './contrast';
import { hslToSrgb } from './convert/hsl-to-srgb';
import { hwbToSrgb } from './convert/hwb-to-srgb';
import { labToXyz } from './convert/lab-to-xyz';
import { lchToLab } from './convert/lch-to-lab';
import { oklabToOklch } from './convert/oklab-to-oklch';
import { srgbToLinear } from './convert/srgb-linear';
import { xyzToOklab } from './convert/xyz-to-oklab';
import { gamutMapOklch } from './gamut-map';
import { relativeLuminance } from './luminance';
import { parseColor } from './parse';
import type { ContrastResult, SRGBColor } from './types';

export type { ComplianceLevel, ContrastResult } from './types';

/**
 * Parse a color string or throw a descriptive error.
 *
 * Supports sRGB hex strings, CSS named colors, RGB functional notation
 * (rgb(), rgba()), HSL functional notation (hsl(), hsla()),
 * HWB functional notation (hwb()), LAB/LCH (lab(), lch()),
 * and OKLAB/OKLCH (oklab(), oklch()).
 * Non-sRGB inputs are converted to sRGB via the appropriate pipeline.
 */
function parseOrThrow(input: string): SRGBColor {
  const parsed = parseColor(input);
  if (parsed === null) {
    throw new Error(`Invalid color: "${input}"`);
  }
  switch (parsed.space) {
    case 'srgb':
      return parsed;
    case 'hsl':
      return hslToSrgb(parsed);
    case 'hwb':
      return hwbToSrgb(parsed);
    case 'oklch':
      return gamutMapOklch(parsed);
    case 'oklab':
      return gamutMapOklch(oklabToOklch(parsed));
    case 'lab': {
      const xyz = labToXyz(parsed);
      return gamutMapOklch(oklabToOklch(xyzToOklab(xyz, parsed.alpha)));
    }
    case 'lch': {
      const lab = lchToLab(parsed);
      const xyz = labToXyz(lab);
      return gamutMapOklch(oklabToOklch(xyzToOklab(xyz, lab.alpha)));
    }
  }
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
 * Accepts any supported color format (hex, named colors, rgb()/rgba(),
 * hsl()/hsla(), hwb(), lab(), lch(), oklab(), oklch()).
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
 * Accepts any supported color format (hex, named colors, rgb()/rgba(),
 * hsl()/hsla(), hwb(), lab(), lch(), oklab(), oklch()).
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
