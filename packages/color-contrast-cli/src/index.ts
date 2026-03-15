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
import { parseColor, parseColorDetailed } from './parse';
import { diagnoseColorError } from './parse/diagnose';
import { suggestForeground as suggestForegroundCore } from './suggest';
import type {
  ColorTrace,
  ContrastResult,
  ParsedColor,
  SRGBColor,
  SuggestResult,
  VerboseResult,
} from './types';

export type {
  ComplianceLevel,
  ContrastResult,
  SuggestResult,
  VerboseResult,
} from './types';

/**
 * Convert a ParsedColor to sRGB via the appropriate pipeline.
 */
function toSrgb(parsed: ParsedColor): SRGBColor {
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
    throw new Error(diagnoseColorError(input));
  }
  return toSrgb(parsed);
}

/**
 * Parse a color string and return a full trace, or throw a descriptive error.
 */
function parseOrThrowDetailed(input: string): ColorTrace {
  const detail = parseColorDetailed(input);
  if (detail === null) {
    throw new Error(diagnoseColorError(input));
  }
  return {
    input,
    format: detail.format,
    parsed: detail.parsed,
    srgb: toSrgb(detail.parsed),
  };
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
 * Validate two color strings and return an array of diagnostic error messages.
 *
 * Returns an empty array when both colors are valid.
 * Useful for CLI pre-validation so that all errors are reported at once,
 * rather than failing on the first invalid color.
 */
export function validateColors(
  foreground: string,
  background: string,
): string[] {
  const errors: string[] = [];
  if (parseColor(foreground) === null)
    errors.push(diagnoseColorError(foreground));
  if (parseColor(background) === null)
    errors.push(diagnoseColorError(background));
  return errors;
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

/**
 * Evaluate WCAG 2.1 contrast with full pipeline trace.
 *
 * Returns intermediate values at each step for verbose/debug output:
 * format detection, parsed values, sRGB conversion, alpha compositing,
 * luminance calculation, and contrast evaluation.
 */
/**
 * Suggest a foreground color that meets the target WCAG contrast ratio.
 *
 * Adjusts only the OkLCH lightness of the foreground, preserving
 * its chroma and hue to minimize perceptual distance from the original.
 *
 * @returns Suggested hex color and its ContrastResult, or nulls if already passing or impossible
 */
export function suggestForeground(
  foreground: string,
  background: string,
  targetRatio: number,
): SuggestResult {
  const fg = parseOrThrow(foreground);
  const bg = parseOrThrow(background);
  return suggestForegroundCore(fg, bg, targetRatio);
}

export function checkContrastVerbose(
  foreground: string,
  background: string,
): VerboseResult {
  const fgTrace = parseOrThrowDetailed(foreground);
  const bgTrace = parseOrThrowDetailed(background);

  const alphaComposited = fgTrace.srgb.alpha < 1 || bgTrace.srgb.alpha < 1;

  const [fgLum, bgLum] = colorToLuminance(fgTrace.srgb, bgTrace.srgb);
  const result = evaluateContrast(fgLum, bgLum);

  return {
    foreground: fgTrace,
    background: bgTrace,
    alphaComposited,
    fgLuminance: fgLum,
    bgLuminance: bgLum,
    result,
  };
}
