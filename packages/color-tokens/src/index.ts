/**
 * Color Tokens - TypeScript Utilities
 *
 * This module exports types and utilities for working with color tokens.
 */

/**
 * Available themes (light/dark)
 */
export type Theme = 'light' | 'dark';

/**
 * Available primary colors
 */
export type PrimaryColor = 'blue' | 'green' | 'purple' | 'orange';

/**
 * Primary color shade levels
 */
export type PrimaryShade =
  | '50'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'
  | '950';

/**
 * Semantic color token names
 */
export type SemanticColorToken =
  | 'background'
  | 'foreground'
  | 'primary'
  | 'primary-foreground'
  | 'muted'
  | 'muted-foreground'
  | 'border';

/**
 * All available themes
 */
export const themes: Theme[] = ['light', 'dark'];

/**
 * All available primary colors
 */
export const primaryColors: PrimaryColor[] = [
  'blue',
  'green',
  'purple',
  'orange',
];

/**
 * All primary color shades
 */
export const primaryShades: PrimaryShade[] = [
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  '950',
];

/**
 * Get the CSS variable name for a primary color shade
 */
export function getPrimaryColorVar(shade: PrimaryShade): string {
  return `var(--color-primary-${shade})`;
}

/**
 * Get the CSS variable name for a semantic color token
 */
export function getSemanticColorVar(token: SemanticColorToken): string {
  return `var(--color-${token})`;
}

/**
 * Set the theme on an element
 */
export function setTheme(element: HTMLElement, theme: Theme): void {
  element.setAttribute('data-theme', theme);
}

/**
 * Set the primary color on an element
 */
export function setPrimaryColor(
  element: HTMLElement,
  color: PrimaryColor,
): void {
  element.setAttribute('data-primary', color);
}

/**
 * Get the current theme from an element
 */
export function getTheme(element: HTMLElement): Theme | null {
  const theme = element.getAttribute('data-theme');
  return themes.includes(theme as Theme) ? (theme as Theme) : null;
}

/**
 * Get the current primary color from an element
 */
export function getPrimaryColor(element: HTMLElement): PrimaryColor | null {
  const color = element.getAttribute('data-primary');
  return primaryColors.includes(color as PrimaryColor)
    ? (color as PrimaryColor)
    : null;
}

/**
 * Primary color palette definitions for programmatic access
 */
export const primaryColorPalettes: Record<
  PrimaryColor,
  Record<PrimaryShade, string>
> = {
  blue: {
    '50': '#eff6ff',
    '100': '#dbeafe',
    '200': '#bfdbfe',
    '300': '#93c5fd',
    '400': '#60a5fa',
    '500': '#3b82f6',
    '600': '#2563eb',
    '700': '#1d4ed8',
    '800': '#1e40af',
    '900': '#1e3a8a',
    '950': '#172554',
  },
  green: {
    '50': '#f0fdf4',
    '100': '#dcfce7',
    '200': '#bbf7d0',
    '300': '#86efac',
    '400': '#4ade80',
    '500': '#22c55e',
    '600': '#16a34a',
    '700': '#15803d',
    '800': '#166534',
    '900': '#14532d',
    '950': '#052e16',
  },
  purple: {
    '50': '#faf5ff',
    '100': '#f3e8ff',
    '200': '#e9d5ff',
    '300': '#d8b4fe',
    '400': '#c084fc',
    '500': '#a855f7',
    '600': '#9333ea',
    '700': '#7e22ce',
    '800': '#6b21a8',
    '900': '#581c87',
    '950': '#3b0764',
  },
  orange: {
    '50': '#fff7ed',
    '100': '#ffedd5',
    '200': '#fed7aa',
    '300': '#fdba74',
    '400': '#fb923c',
    '500': '#f97316',
    '600': '#ea580c',
    '700': '#c2410c',
    '800': '#9a3412',
    '900': '#7c2d12',
    '950': '#431407',
  },
};

/**
 * Theme color definitions for programmatic access
 */
export const themeColors: Record<
  Theme,
  {
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    primaryForeground: string;
  }
> = {
  light: {
    background: '#ffffff',
    foreground: '#0a0a0a',
    muted: '#f5f5f5',
    mutedForeground: '#737373',
    border: '#e5e5e5',
    primaryForeground: '#ffffff',
  },
  dark: {
    background: '#0a0a0a',
    foreground: '#fafafa',
    muted: '#262626',
    mutedForeground: '#a3a3a3',
    border: '#262626',
    primaryForeground: '#000000',
  },
};
