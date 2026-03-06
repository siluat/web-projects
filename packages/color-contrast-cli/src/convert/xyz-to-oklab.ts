import type { OKLABColor, XYZColor } from '../types';

/**
 * Convert an XYZ-D65 color to OKLAB.
 *
 * Inverse of `oklabToXyz`:
 * 1. XYZ-D65 → LMS (linear matrix multiply)
 * 2. LMS → cbrt(LMS) (cube root each component)
 * 3. cbrt(LMS) → OKLAB (linear matrix multiply)
 *
 * Matrices from CSS Color Level 4 reference implementation:
 * @see https://drafts.csswg.org/css-color-4/conversions.js
 * @see https://www.w3.org/TR/css-color-4/#oklab-to-predefined
 */

// XYZ-D65 → LMS (linear domain)
const XYZ_TO_LMS = [
  [0.819022437996703, 0.3619062600528904, -0.1288737815209879],
  [0.0329836539323885, 0.9292868615863434, 0.0361446663506424],
  [0.0481771893596242, 0.2642395317527308, 0.6335478284694309],
] as const;

// LMS (cube-root domain) → OKLAB
const LMS_TO_OKLAB = [
  [0.210454268309314, 0.7936177747023054, -0.0040720430116193],
  [1.9779985324311684, -2.4285922420485799, 0.450593709617411],
  [0.0259040424655478, 0.7827717124575296, -0.8086757549230774],
] as const;

export function xyzToOklab(xyz: XYZColor, alpha: number): OKLABColor {
  // Step 1: XYZ-D65 → LMS (linear domain)
  const [[a00, a01, a02], [a10, a11, a12], [a20, a21, a22]] = XYZ_TO_LMS;
  const lLinear = a00 * xyz.x + a01 * xyz.y + a02 * xyz.z;
  const mLinear = a10 * xyz.x + a11 * xyz.y + a12 * xyz.z;
  const sLinear = a20 * xyz.x + a21 * xyz.y + a22 * xyz.z;

  // Step 2: cube root
  const lCbrt = Math.cbrt(lLinear);
  const mCbrt = Math.cbrt(mLinear);
  const sCbrt = Math.cbrt(sLinear);

  // Step 3: LMS (cube-root domain) → OKLAB
  const [[b00, b01, b02], [b10, b11, b12], [b20, b21, b22]] = LMS_TO_OKLAB;

  return {
    space: 'oklab',
    l: b00 * lCbrt + b01 * mCbrt + b02 * sCbrt,
    a: b10 * lCbrt + b11 * mCbrt + b12 * sCbrt,
    b: b20 * lCbrt + b21 * mCbrt + b22 * sCbrt,
    alpha,
  };
}
