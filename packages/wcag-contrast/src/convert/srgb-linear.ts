import type { LinearRGB, OpaqueRGB } from '../types';

/**
 * IEC 61966-2-1 sRGB transfer function constants.
 *
 * The piecewise function has a linear segment below the threshold
 * and a power-curve segment above it. These constants define the
 * junction point and the curve parameters.
 *
 * @see https://www.w3.org/TR/css-color-4/#color-conversion-code
 * @see ADR-004 for threshold choice (0.04045 vs WCAG 2.1's 0.03928)
 */
const GAMMA_THRESHOLD = 0.04045;
const LINEAR_SLOPE = 12.92;
const POWER_OFFSET = 0.055;
const POWER_SCALE = 1.055;
const POWER_EXPONENT = 2.4;

/**
 * Convert a single gamma-encoded sRGB channel value to linear light.
 *
 * Uses the IEC 61966-2-1 inverse transfer function:
 * - Below threshold: linear segment `channel / 12.92`
 * - Above threshold: power curve `((channel + 0.055) / 1.055) ^ 2.4`
 *
 * @param channel - Gamma-encoded sRGB value in [0, 1]
 * @returns Linear-light value in [0, 1]
 */
export function srgbChannelToLinear(channel: number): number {
  if (channel <= GAMMA_THRESHOLD) {
    return channel / LINEAR_SLOPE;
  }
  return ((channel + POWER_OFFSET) / POWER_SCALE) ** POWER_EXPONENT;
}

/**
 * Convert an opaque gamma-encoded sRGB color to linear-light RGB.
 *
 * Applies {@link srgbChannelToLinear} independently to each channel.
 *
 * @param color - Gamma-encoded sRGB color (after alpha compositing)
 * @returns Linear-light RGB for WCAG luminance calculation
 */
export function srgbToLinear(color: OpaqueRGB): LinearRGB {
  return {
    r: srgbChannelToLinear(color.r),
    g: srgbChannelToLinear(color.g),
    b: srgbChannelToLinear(color.b),
  };
}
