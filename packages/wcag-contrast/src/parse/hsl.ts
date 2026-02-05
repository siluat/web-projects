import type { RGB } from '../types';
import { createFunctionalParser } from './core/functional-parser';
import { hslSchema } from './schemas/hsl.schema';

/**
 * Parse HSL/HSLA color string to RGB
 * Supports:
 * - hsl(180, 50%, 50%), hsla(180, 50%, 50%, 0.5)
 * - hsl(180 50% 50%), hsl(180 50% 50% / 0.5)
 * - hsl(180deg 50% 50%), hsl(0.5turn 50% 50%)
 */
export const parseHsl: (color: string) => RGB | null =
  createFunctionalParser(hslSchema);
