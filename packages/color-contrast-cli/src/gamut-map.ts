import { linearToSrgbChannel, oklabToXyz, xyzToLinearRgb } from './convert';
import type { LinearRGB, OKLCHColor, SRGBColor, XYZColor } from './types';

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

// --- Inverse matrices (for clipped-color → OKLAB conversion) ---

/**
 * Linear sRGB → XYZ-D65 matrix.
 * Exact rational fractions from CSS Color Level 4 reference implementation.
 * @see https://drafts.csswg.org/css-color-4/conversions.js
 */
const LINEAR_SRGB_TO_XYZ = [
  [506752 / 1228815, 87881 / 245763, 12673 / 70218],
  [87098 / 409605, 175762 / 245763, 12673 / 175545],
  [7918 / 409605, 87881 / 737289, 1001167 / 1053270],
] as const;

/**
 * XYZ-D65 → LMS matrix (for OKLAB conversion).
 * @see https://drafts.csswg.org/css-color-4/conversions.js
 */
const XYZ_TO_LMS = [
  [0.819022437996703, 0.3619062600528904, -0.1288737815209879],
  [0.0329836539323885, 0.9292868615863434, 0.0361446663506424],
  [0.0481771893596242, 0.2642395317527308, 0.6335478284694309],
] as const;

/**
 * LMS (cube-root domain) → OKLAB matrix.
 * @see https://drafts.csswg.org/css-color-4/conversions.js
 */
const LMS_TO_OKLAB = [
  [0.210454268309314, 0.7936177747023054, -0.0040720430116193],
  [1.9779985324311684, -2.4285922420485799, 0.450593709617411],
  [0.0259040424655478, 0.7827717124575296, -0.8086757549230774],
] as const;

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

function linearRgbToXyz(rgb: LinearRGB): XYZColor {
  const [[m00, m01, m02], [m10, m11, m12], [m20, m21, m22]] =
    LINEAR_SRGB_TO_XYZ;
  return {
    x: m00 * rgb.r + m01 * rgb.g + m02 * rgb.b,
    y: m10 * rgb.r + m11 * rgb.g + m12 * rgb.b,
    z: m20 * rgb.r + m21 * rgb.g + m22 * rgb.b,
  };
}

function xyzToOklab(xyz: XYZColor): OklabTriplet {
  const [[a00, a01, a02], [a10, a11, a12], [a20, a21, a22]] = XYZ_TO_LMS;
  const lLinear = a00 * xyz.x + a01 * xyz.y + a02 * xyz.z;
  const mLinear = a10 * xyz.x + a11 * xyz.y + a12 * xyz.z;
  const sLinear = a20 * xyz.x + a21 * xyz.y + a22 * xyz.z;

  const lCbrt = Math.cbrt(lLinear);
  const mCbrt = Math.cbrt(mLinear);
  const sCbrt = Math.cbrt(sLinear);

  const [[b00, b01, b02], [b10, b11, b12], [b20, b21, b22]] = LMS_TO_OKLAB;
  return {
    l: b00 * lCbrt + b01 * mCbrt + b02 * sCbrt,
    a: b10 * lCbrt + b11 * mCbrt + b12 * sCbrt,
    b: b20 * lCbrt + b21 * mCbrt + b22 * sCbrt,
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
  let clippedOklab = xyzToOklab(linearRgbToXyz(clipped));

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
    clippedOklab = xyzToOklab(linearRgbToXyz(clipped));
    const dE = deltaEOK(currentOklab, clippedOklab);

    if (dE - JND < GAMUT_EPSILON) {
      if (JND - dE < GAMUT_EPSILON) {
        break;
      }
      min = chroma;
    } else {
      bestClip = clipped;
      max = chroma;
    }
  }

  // Step 5: Return gamma-encoded bestClip
  return gammaEncode(bestClip, color.alpha);
}
