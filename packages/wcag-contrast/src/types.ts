// Parse results
export interface SRGBColor {
  space: 'srgb';
  r: number;
  g: number;
  b: number;
  alpha: number;
}
export interface HSLColor {
  space: 'hsl';
  h: number;
  s: number;
  l: number;
  alpha: number;
}
export interface HWBColor {
  space: 'hwb';
  h: number;
  w: number;
  b: number;
  alpha: number;
}
export interface LABColor {
  space: 'lab';
  l: number;
  a: number;
  b: number;
  alpha: number;
}
export interface LCHColor {
  space: 'lch';
  l: number;
  c: number;
  h: number;
  alpha: number;
}
export interface OKLABColor {
  space: 'oklab';
  l: number;
  a: number;
  b: number;
  alpha: number;
}
export interface OKLCHColor {
  space: 'oklch';
  l: number;
  c: number;
  h: number;
  alpha: number;
}
export type ParsedColor =
  | SRGBColor
  | HSLColor
  | HWBColor
  | LABColor
  | LCHColor
  | OKLABColor
  | OKLCHColor;

// Intermediate types for computation
export interface LinearRGB {
  r: number;
  g: number;
  b: number;
}
export interface XYZColor {
  x: number;
  y: number;
  z: number;
}
export interface OpaqueRGB {
  r: number;
  g: number;
  b: number;
}

// Public API types
export type ComplianceLevel = 'AAA' | 'AA' | 'Fail';
export interface ContrastResult {
  ratio: number;
  normalText: ComplianceLevel;
  largeText: ComplianceLevel;
}
