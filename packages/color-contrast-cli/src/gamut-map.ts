import {
  linearRgbToXyz,
  linearToSrgbChannel,
  oklabToXyz,
  xyzToLinearRgb,
  xyzToOklab,
} from './convert';
import type { LinearRGB, OKLCHColor, SRGBColor } from './types';

/**
 * CSS Color Level 4 Section 13.2 gamut mapping algorithm.
 *
 * Maps an OKLCH color into the sRGB gamut by binary-searching on chroma,
 * producing the closest in-gamut color as perceived in OKLAB space.
 * Returns a gamma-encoded SRGBColor with alpha preserved.
 *
 * @see https://www.w3.org/TR/css-color-4/#css-gamut-mapping
 * @see ADR-002 for the decision to use this algorithm
 */

// --- Constants ---

/** Just Noticeable Difference in OKLAB (perceptual threshold). */
const JND = 0.02;
/** Convergence epsilon for binary search. */
const GAMUT_EPSILON = 0.000075;
/** Maximum binary search iterations. */
const MAX_ITERATIONS = 64;

const DEG_TO_RAD = Math.PI / 180;

// --- Private helpers ---

interface OklabTriplet {
  l: number;
  a: number;
  b: number;
}

function inGamut(rgb: LinearRGB): boolean {
  return (
    rgb.r >= -GAMUT_EPSILON &&
    rgb.r <= 1 + GAMUT_EPSILON &&
    rgb.g >= -GAMUT_EPSILON &&
    rgb.g <= 1 + GAMUT_EPSILON &&
    rgb.b >= -GAMUT_EPSILON &&
    rgb.b <= 1 + GAMUT_EPSILON
  );
}

function clipLinearRgb(rgb: LinearRGB): LinearRGB {
  return {
    r: Math.max(0, Math.min(1, rgb.r)),
    g: Math.max(0, Math.min(1, rgb.g)),
    b: Math.max(0, Math.min(1, rgb.b)),
  };
}

function deltaEOK(a: OklabTriplet, b: OklabTriplet): number {
  const dl = a.l - b.l;
  const da = a.a - b.a;
  const db = a.b - b.b;
  return Math.sqrt(dl * dl + da * da + db * db);
}

function polarToCartesian(c: number, h: number): { a: number; b: number } {
  // Guard: when C=0, hue is irrelevant (may be NaN). 0 * cos(NaN) = NaN in JS.
  if (c === 0) return { a: 0, b: 0 };
  const hRad = h * DEG_TO_RAD;
  return { a: c * Math.cos(hRad), b: c * Math.sin(hRad) };
}

function oklchToLinearRgb(l: number, c: number, h: number): LinearRGB {
  const { a, b } = polarToCartesian(c, h);
  const xyz = oklabToXyz({ space: 'oklab', l, a, b, alpha: 1 });
  return xyzToLinearRgb(xyz);
}

function oklchToOklabTriplet(l: number, c: number, h: number): OklabTriplet {
  const { a, b } = polarToCartesian(c, h);
  return { l, a, b };
}

function gammaEncode(rgb: LinearRGB, alpha: number): SRGBColor {
  return {
    space: 'srgb',
    r: linearToSrgbChannel(rgb.r),
    g: linearToSrgbChannel(rgb.g),
    b: linearToSrgbChannel(rgb.b),
    alpha,
  };
}

// --- Public API ---

export function gamutMapOklch(color: OKLCHColor): SRGBColor {
  // Step 1: Lightness extremes
  if (color.l >= 1) {
    return { space: 'srgb', r: 1, g: 1, b: 1, alpha: color.alpha };
  }
  if (color.l <= 0) {
    return { space: 'srgb', r: 0, g: 0, b: 0, alpha: color.alpha };
  }

  // Step 2: Convert to linear sRGB via forward chain
  const linearRgb = oklchToLinearRgb(color.l, color.c, color.h);

  if (inGamut(linearRgb)) {
    return gammaEncode(clipLinearRgb(linearRgb), color.alpha);
  }

  // Step 3: Initial clip check — if close enough, return clipped
  let clipped = clipLinearRgb(linearRgb);
  const originOklab = oklchToOklabTriplet(color.l, color.c, color.h);
  let clippedOklab = xyzToOklab(linearRgbToXyz(clipped), 1);

  if (deltaEOK(originOklab, clippedOklab) < JND) {
    return gammaEncode(clipped, color.alpha);
  }

  // Step 4: Binary search on chroma
  let min = 0;
  let max = color.c;
  let bestClip = clipped;

  for (let i = 0; i < MAX_ITERATIONS && max - min > GAMUT_EPSILON; i++) {
    const chroma = (min + max) / 2;

    const currentLinear = oklchToLinearRgb(color.l, chroma, color.h);
    const currentOklab = oklchToOklabTriplet(color.l, chroma, color.h);

    if (inGamut(currentLinear)) {
      min = chroma;
      continue;
    }

    clipped = clipLinearRgb(currentLinear);
    bestClip = clipped;
    clippedOklab = xyzToOklab(linearRgbToXyz(clipped), 1);
    const dE = deltaEOK(currentOklab, clippedOklab);

    if (Math.abs(dE - JND) < GAMUT_EPSILON) {
      break;
    }
    if (dE < JND) {
      min = chroma;
    } else {
      max = chroma;
    }
  }

  // Step 5: Return gamma-encoded bestClip
  return gammaEncode(bestClip, color.alpha);
}
