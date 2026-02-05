/**
 * RGB color representation (0-255 for each channel)
 */
export interface RGB {
  r: number;
  g: number;
  b: number;
  a?: number;
}

/**
 * HSL color representation
 * h: 0-360, s: 0-100, l: 0-100
 */
export interface HSL {
  h: number;
  s: number;
  l: number;
  a?: number;
}

/**
 * LCH color representation (CIE LCH)
 * l: 0-100, c: 0-150+, h: 0-360
 */
export interface LCH {
  l: number;
  c: number;
  h: number;
  a?: number;
}

/**
 * OKLCH color representation
 * l: 0-1, c: 0-0.4+, h: 0-360
 */
export interface OKLCH {
  l: number;
  c: number;
  h: number;
  a?: number;
}

/**
 * WCAG compliance level
 */
export type ComplianceLevel = 'AAA' | 'AA' | 'Fail';

/**
 * Text size category for WCAG compliance
 */
export type TextSize = 'normal' | 'large';

/**
 * Complete contrast analysis result
 */
export interface ContrastResult {
  ratio: number;
  ratioString: string;
  foreground: string;
  background: string;
  normalText: {
    aa: boolean;
    aaa: boolean;
  };
  largeText: {
    aa: boolean;
    aaa: boolean;
  };
  nonText: {
    aa: boolean;
  };
  level: ComplianceLevel;
}
