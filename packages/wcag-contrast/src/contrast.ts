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
    if (ratio >= min) {
      return level;
    }
  }
  return 'Fail';
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
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Math.round(ratio * 100) / 100;
}

/**
 * Evaluate WCAG 2.1 contrast compliance for two luminance values.
 *
 * Returns the contrast ratio and compliance levels for both
 * normal text (AA >= 4.5, AAA >= 7) and large text (AA >= 3, AAA >= 4.5).
 */
export function evaluateContrast(l1: number, l2: number): ContrastResult {
  const ratio = computeContrastRatio(l1, l2);
  return {
    ratio,
    normalText: gradeLevel(ratio, NORMAL_TEXT_THRESHOLDS),
    largeText: gradeLevel(ratio, LARGE_TEXT_THRESHOLDS),
  };
}
