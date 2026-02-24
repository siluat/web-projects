import type { ComplianceLevel, ContrastResult } from './types';

/**
 * WCAG 2.1 contrast ratio thresholds, ordered strictest-first.
 *
 * Each entry maps a minimum ratio to the compliance level it grants.
 * The grading function walks this array and returns the first match,
 * so order matters: AAA before AA before Fail.
 *
 * @see https://www.w3.org/TR/WCAG21/#contrast-minimum
 * @see https://www.w3.org/TR/WCAG21/#contrast-enhanced
 */
const NORMAL_TEXT_THRESHOLDS = [
  { min: 7, level: 'AAA' },
  { min: 4.5, level: 'AA' },
] as const;

const LARGE_TEXT_THRESHOLDS = [
  { min: 4.5, level: 'AAA' },
  { min: 3, level: 'AA' },
] as const;

/**
 * Tolerance for floating-point comparison in threshold checks.
 *
 * IEEE 754 arithmetic can produce results like 6.999999999999999 instead
 * of 7 when dividing (0.35 / 0.05). This tolerance absorbs such artifacts
 * without promoting genuinely sub-threshold ratios (e.g., 4.496).
 */
const FLOAT_TOLERANCE = 1e-10;

/**
 * Determine the compliance level for a contrast ratio against thresholds.
 *
 * Walks the threshold array (strictest-first) and returns the first
 * level whose minimum is met. Falls back to 'Fail'.
 */
function gradeLevel(
  ratio: number,
  thresholds: ReadonlyArray<{
    readonly min: number;
    readonly level: ComplianceLevel;
  }>,
): ComplianceLevel {
  for (const { min, level } of thresholds) {
    if (ratio >= min - FLOAT_TOLERANCE) {
      return level;
    }
  }
  return 'Fail';
}

/**
 * Compute the unrounded WCAG 2.1 contrast ratio.
 *
 * @see https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
function rawContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Compute the WCAG 2.1 contrast ratio between two relative luminance values.
 *
 * Formula: (L_lighter + 0.05) / (L_darker + 0.05)
 *
 * The order of arguments does not matter — the function
 * automatically determines which is lighter.
 * Result is rounded to two decimal places.
 *
 * @see https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
export function computeContrastRatio(l1: number, l2: number): number {
  return Math.round(rawContrastRatio(l1, l2) * 100) / 100;
}

/**
 * Evaluate WCAG 2.1 contrast compliance for two luminance values.
 *
 * Grading uses the unrounded ratio to avoid boundary misclassification
 * (e.g., 4.496 rounding to 4.50 should not pass AA's 4.5 threshold).
 * The returned `ratio` field is rounded for display purposes.
 *
 * @see https://www.w3.org/TR/WCAG21/#contrast-minimum
 */
export function evaluateContrast(l1: number, l2: number): ContrastResult {
  const raw = rawContrastRatio(l1, l2);
  const ratio = Math.round(raw * 100) / 100;
  return {
    ratio,
    normalText: gradeLevel(raw, NORMAL_TEXT_THRESHOLDS),
    largeText: gradeLevel(raw, LARGE_TEXT_THRESHOLDS),
  };
}
