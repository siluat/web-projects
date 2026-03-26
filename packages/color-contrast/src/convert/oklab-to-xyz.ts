import type { OKLABColor, XYZColor } from '../types';

/**
 * Convert an OKLABColor to XYZ-D65.
 *
 * 1. OKLAB → LMS (linear matrix multiply)
 * 2. LMS → LMS³ (cube each component — undo the cube root in OKLAB's forward transform)
 * 3. LMS³ → XYZ-D65 (linear matrix multiply)
 *
 * No chromatic adaptation needed — OKLAB is already D65-referenced.
 *
 * Matrices from CSS Color Level 4 reference implementation:
 * @see https://drafts.csswg.org/css-color-4/conversions.js
 * @see https://www.w3.org/TR/css-color-4/#oklab-to-predefined
 */

// OKLAB → LMS (cube-root domain)
const OKLAB_TO_LMS = [
  [1.0, 0.3963377773761749, 0.2158037573099136],
  [1.0, -0.1055613458156586, -0.0638541728258133],
  [1.0, -0.0894841775298119, -1.2914855480194092],
] as const;

// LMS (linear domain) → XYZ-D65
const LMS_TO_XYZ = [
  [1.2268798758459243, -0.5578149944602171, 0.2813910456659647],
  [-0.0405757452148008, 1.112286803280317, -0.0717110580655164],
  [-0.0763729366746601, -0.4214933324022432, 1.5869240198367816],
] as const;

export function oklabToXyz(color: OKLABColor): XYZColor {
  // Step 1: OKLAB → LMS (cube-root domain)
  const [[a00, a01, a02], [a10, a11, a12], [a20, a21, a22]] = OKLAB_TO_LMS;
  const lCbrt = a00 * color.l + a01 * color.a + a02 * color.b;
  const mCbrt = a10 * color.l + a11 * color.a + a12 * color.b;
  const sCbrt = a20 * color.l + a21 * color.a + a22 * color.b;

  // Step 2: cube to get linear LMS
  const l = lCbrt ** 3;
  const m = mCbrt ** 3;
  const s = sCbrt ** 3;

  // Step 3: LMS → XYZ-D65
  const [[b00, b01, b02], [b10, b11, b12], [b20, b21, b22]] = LMS_TO_XYZ;

  return {
    x: b00 * l + b01 * m + b02 * s,
    y: b10 * l + b11 * m + b12 * s,
    z: b20 * l + b21 * m + b22 * s,
  };
}
