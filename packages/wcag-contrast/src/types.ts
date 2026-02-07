// Internal (not exported from public API)
export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a?: number; // 0-1
}

// Public types
export type ComplianceLevel = 'AAA' | 'AA' | 'Fail';
export type TextSize = 'normal' | 'large';

export interface ContrastResult {
  ratio: number;
  normalText: { aa: boolean; aaa: boolean };
  largeText: { aa: boolean; aaa: boolean };
}
