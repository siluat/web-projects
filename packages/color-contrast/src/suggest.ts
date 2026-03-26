import { alphaComposite } from './alpha-composite';
import { evaluateContrast, rawContrastRatio } from './contrast';
import { srgbToLinear, srgbToOklch } from './convert';
import { gamutMapOklch } from './gamut-map';
import { relativeLuminance } from './luminance';
import type { OKLCHColor, SRGBColor, SuggestResult } from './types';

// --- Constants ---

/** Binary search convergence condition for luminance difference. */
const LUMINANCE_EPSILON = 1e-4;
/** Maximum binary search iterations. */
const MAX_ITERATIONS = 50;
/** L-axis adjustment step for post-quantization correction. */
const L_ADJUSTMENT_STEP = 0.001;
/** Maximum post-quantization adjustment attempts. */
const MAX_ADJUSTMENT_STEPS = 20;

type Direction = 'darker' | 'lighter';

// --- Internal helpers ---

/**
 * Convert SRGBColor (0–1 float channels) to hex string.
 *
 * Opaque colors produce 6-digit hex (#rrggbb).
 * Semi-transparent colors produce 8-digit hex (#rrggbbaa).
 */
function srgbToHex(color: SRGBColor): string {
  const r = Math.round(color.r * 255)
    .toString(16)
    .padStart(2, '0');
  const g = Math.round(color.g * 255)
    .toString(16)
    .padStart(2, '0');
  const b = Math.round(color.b * 255)
    .toString(16)
    .padStart(2, '0');
  if (color.alpha < 1) {
    const a = Math.round(color.alpha * 255)
      .toString(16)
      .padStart(2, '0');
    return `#${r}${g}${b}${a}`;
  }
  return `#${r}${g}${b}`;
}

/**
 * Parse a hex string back to SRGBColor for post-quantization verification.
 *
 * Only handles #rrggbb and #rrggbbaa — the output formats of {@link srgbToHex}.
 */
function hexToSrgb(hex: string): SRGBColor {
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255;
  const alpha =
    hex.length === 9 ? Number.parseInt(hex.slice(7, 9), 16) / 255 : 1;
  return { space: 'srgb', r, g, b, alpha };
}

/**
 * Compute the target foreground luminance by inverting the WCAG contrast formula.
 *
 * Darker direction:  ratio = (bgLum + 0.05) / (fgLum + 0.05)
 *   → fgLum = (bgLum + 0.05) / ratio − 0.05
 *
 * Lighter direction: ratio = (fgLum + 0.05) / (bgLum + 0.05)
 *   → fgLum = (bgLum + 0.05) × ratio − 0.05
 *
 * @see https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
function computeTargetLuminance(
  bgLum: number,
  targetRatio: number,
  direction: Direction,
): number {
  if (direction === 'darker') {
    return (bgLum + 0.05) / targetRatio - 0.05;
  }
  return (bgLum + 0.05) * targetRatio - 0.05;
}

/**
 * Compute the relative luminance of an OkLCH color composited over a background.
 *
 * Pipeline: OkLCH → gamutMapOklch → alphaComposite → srgbToLinear → luminance
 */
function computeLuminanceFromOklch(
  l: number,
  c: number,
  h: number,
  alpha: number,
  bg: SRGBColor,
): number {
  const oklch: OKLCHColor = { space: 'oklch', l, c, h, alpha };
  const srgb = gamutMapOklch(oklch);
  const [fgComposited] = alphaComposite(srgb, bg);
  const linear = srgbToLinear(fgComposited);
  return relativeLuminance(linear);
}

/**
 * Binary search on OkLCH L axis to find the lightness that produces
 * the target luminance after gamut mapping and alpha compositing.
 *
 * Relies on the empirically verified near-monotonicity of the
 * L → luminance mapping (max deviation ~4.6e-5, negligible).
 *
 * @returns The OkLCH L value whose pipeline luminance is closest to targetLum.
 */
function binarySearchLightness(
  c: number,
  h: number,
  alpha: number,
  bg: SRGBColor,
  targetLum: number,
): number {
  let lo = 0;
  let hi = 1;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const mid = (lo + hi) / 2;
    const lum = computeLuminanceFromOklch(mid, c, h, alpha, bg);

    if (Math.abs(lum - targetLum) < LUMINANCE_EPSILON) {
      return mid;
    }

    if (lum < targetLum) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return (lo + hi) / 2;
}

/**
 * Verify that a hex-quantized color meets the target ratio.
 *
 * Each sRGB channel rounds to the nearest 1/255 during hex conversion,
 * shifting luminance by up to ~0.003 and the contrast ratio by up to ~0.045.
 * Instead of adding a safety margin, we verify the actual hex-quantized ratio
 * and nudge L in the contrast-increasing direction if needed.
 */
function verifyAndAdjust(
  l: number,
  direction: Direction,
  c: number,
  h: number,
  alpha: number,
  bg: SRGBColor,
  bgLum: number,
  targetRatio: number,
): { hex: string; fgLum: number } | null {
  let currentL = l;

  for (let i = 0; i <= MAX_ADJUSTMENT_STEPS; i++) {
    if (currentL < 0 || currentL > 1) return null;

    const oklch: OKLCHColor = { space: 'oklch', l: currentL, c, h, alpha };
    const srgb = gamutMapOklch(oklch);
    const hex = srgbToHex(srgb);
    const hexSrgb = hexToSrgb(hex);
    const [fgComposited] = alphaComposite(hexSrgb, bg);
    const hexFgLum = relativeLuminance(srgbToLinear(fgComposited));
    const ratio = rawContrastRatio(hexFgLum, bgLum);

    if (ratio >= targetRatio) {
      return { hex, fgLum: hexFgLum };
    }

    // Nudge L to increase contrast
    if (direction === 'darker') {
      currentL -= L_ADJUSTMENT_STEP;
    } else {
      currentL += L_ADJUSTMENT_STEP;
    }
  }

  return null;
}

// --- Public API ---

/**
 * Suggest a foreground color that meets the target WCAG contrast ratio.
 *
 * Adjusts only the OkLCH lightness (L) of the foreground, preserving
 * its chroma (C) and hue (H) to minimize perceptual distance from the
 * original color.
 *
 * Algorithm:
 * 1. Check if the pair already meets the target ratio (raw, unrounded)
 * 2. Compute target luminance for both darker and lighter directions
 * 3. Binary search on L for each valid direction
 * 4. Pick the candidate closest to the original L
 * 5. Post-quantization verification: hex round-trip + ratio re-check
 *
 * @param fg - Foreground color in sRGB
 * @param bg - Background color in sRGB
 * @param targetRatio - Minimum WCAG contrast ratio (e.g., 4.5 for AA)
 * @returns Suggested hex color and its ContrastResult, or nulls if already passing or impossible
 */
export function suggestForeground(
  fg: SRGBColor,
  bg: SRGBColor,
  targetRatio: number,
): SuggestResult {
  // Step 1: Compute current contrast ratio (raw, unrounded)
  const [fgComposited, bgComposited] = alphaComposite(fg, bg);
  const fgLum = relativeLuminance(srgbToLinear(fgComposited));
  const bgLum = relativeLuminance(srgbToLinear(bgComposited));
  const currentRaw = rawContrastRatio(fgLum, bgLum);

  // Step 2: Already passes → no suggestion needed
  if (currentRaw >= targetRatio) {
    return { suggested: null, result: null };
  }

  // Step 3: Extract OkLCH coordinates, fix C and H
  const oklch = srgbToOklch(fg);
  const { c, h } = oklch;
  const originalL = oklch.l;

  // Step 4: Compute target luminance for both directions
  const darkerTargetLum = computeTargetLuminance(bgLum, targetRatio, 'darker');
  const lighterTargetLum = computeTargetLuminance(
    bgLum,
    targetRatio,
    'lighter',
  );

  // Step 5: Binary search for each valid direction
  interface Candidate {
    l: number;
    direction: Direction;
  }

  const candidates: Candidate[] = [];

  if (darkerTargetLum >= 0) {
    candidates.push({
      l: binarySearchLightness(c, h, fg.alpha, bg, darkerTargetLum),
      direction: 'darker',
    });
  }

  if (lighterTargetLum <= 1) {
    candidates.push({
      l: binarySearchLightness(c, h, fg.alpha, bg, lighterTargetLum),
      direction: 'lighter',
    });
  }

  if (candidates.length === 0) {
    return { suggested: null, result: null };
  }

  // Step 6: Sort by |L_suggested − L_original| (prefer closer)
  candidates.sort(
    (a, b) => Math.abs(a.l - originalL) - Math.abs(b.l - originalL),
  );

  // Step 7: Post-quantization verification (try closer candidate first)
  for (const { l, direction } of candidates) {
    const verified = verifyAndAdjust(
      l,
      direction,
      c,
      h,
      fg.alpha,
      bg,
      bgLum,
      targetRatio,
    );
    if (verified !== null) {
      const result = evaluateContrast(verified.fgLum, bgLum);
      return { suggested: verified.hex, result };
    }
  }

  // Neither direction produced a valid result
  return { suggested: null, result: null };
}
