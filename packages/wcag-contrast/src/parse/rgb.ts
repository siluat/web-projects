import type { RGB } from '../types';
import { extractFunctionContent, splitContent } from './core/functional-parser';
import { createRgbChannelParser, parseAlpha } from './core/parsers';

/**
 * Parse RGB/RGBA color string to RGB
 * Supports:
 * - rgb(255, 128, 0), rgba(255, 128, 0, 0.5)
 * - rgb(255 128 0), rgb(255 128 0 / 0.5)
 * - rgb(100%, 50%, 0%)
 */
export function parseRgb(color: string): RGB | null {
  const extracted = extractFunctionContent(color, ['rgb', 'rgba']);
  if (!extracted) {
    return null;
  }

  const split = splitContent(extracted.content);
  if (!split) {
    return null;
  }

  const { values, alphaPart, hasComma } = split;

  // Handle alpha in comma syntax: rgba(255, 128, 0, 0.5)
  let alpha: number | undefined;
  if (hasComma && values.length === 4 && !alphaPart) {
    const alphaStr = values.pop();
    if (alphaStr) {
      const alphaResult = parseAlpha(alphaStr);
      if (!alphaResult.ok) {
        return null;
      }
      alpha = alphaResult.value;
    }
  } else if (alphaPart) {
    const alphaResult = parseAlpha(alphaPart);
    if (!alphaResult.ok) {
      return null;
    }
    alpha = alphaResult.value;
  }

  if (values.length !== 3) {
    return null;
  }

  // Check if using percentage
  const usePercentage = values.some((v) => v.endsWith('%'));

  // All values should be consistent (all percentage or all numbers)
  const allPercentage = values.every((v) => v.endsWith('%'));
  const allNumber = values.every((v) => !v.endsWith('%'));

  if (!allPercentage && !allNumber) {
    return null;
  }

  const [v0, v1, v2] = values;
  if (!v0 || !v1 || !v2) {
    return null;
  }

  const channelParser = createRgbChannelParser(usePercentage);

  const rResult = channelParser(v0);
  const gResult = channelParser(v1);
  const bResult = channelParser(v2);

  if (!rResult.ok || !gResult.ok || !bResult.ok) {
    return null;
  }

  const result: RGB = { r: rResult.value, g: gResult.value, b: bResult.value };

  if (alpha !== undefined) {
    result.a = alpha;
  }

  return result;
}
