import type { OpaqueRGB, SRGBColor } from './types';

/** White: the default browser page background. */
const WHITE: OpaqueRGB = { r: 1, g: 1, b: 1 };

/**
 * Composite a single channel using simplified source-over.
 *
 * Formula: `fg_alpha * fg_channel + (1 - fg_alpha) * bg_channel`
 *
 * The background is always opaque, so the general Porter-Duff
 * source-over formula simplifies to this form.
 *
 * @see https://www.w3.org/TR/compositing/#generalformula
 */
function compositeChannel(
  fgChannel: number,
  fgAlpha: number,
  bgChannel: number,
): number {
  return fgAlpha * fgChannel + (1 - fgAlpha) * bgChannel;
}

/**
 * Composite an sRGB color over an opaque background.
 *
 * Performed in gamma-encoded sRGB space to match CSS Compositing
 * Level 1 and browser rendering behavior (see ADR-001).
 */
function compositeOver(fg: SRGBColor, bgOpaque: OpaqueRGB): OpaqueRGB {
  return {
    r: compositeChannel(fg.r, fg.alpha, bgOpaque.r),
    g: compositeChannel(fg.g, fg.alpha, bgOpaque.g),
    b: compositeChannel(fg.b, fg.alpha, bgOpaque.b),
  };
}

/**
 * Flatten a foreground/background color pair into opaque colors.
 *
 * Compositing order (ADR-001):
 * 1. Composite background over white (browser default)
 * 2. Composite foreground over the result from step 1
 *
 * @returns Tuple `[composited foreground, composited background]`
 */
export function alphaComposite(
  foreground: SRGBColor,
  background: SRGBColor,
): [fg: OpaqueRGB, bg: OpaqueRGB] {
  const bg = compositeOver(background, WHITE);
  const fg = compositeOver(foreground, bg);
  return [fg, bg];
}
