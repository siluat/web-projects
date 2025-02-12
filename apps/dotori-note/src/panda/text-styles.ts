import { defineTextStyles } from '@pandacss/dev';

export const textStyles = defineTextStyles({
  /**
   * 크기별 텍스트 스타일
   * @reference tailwindcss v3.4.10 참고함
   */
  xs: {
    description: 'Extra small style',
    value: {
      fontSize: '0.75rem',
      lineHeight: '1rem',
    },
  },
  sm: {
    description: 'Small style',
    value: {
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
    },
  },
  base: {
    description: 'Base style',
    value: {
      fontSize: '1rem',
      lineHeight: '1.5rem',
    },
  },
  lg: {
    description: 'Large style',
    value: {
      fontSize: '1.125rem',
      lineHeight: '1.75rem',
    },
  },
  xl: {
    description: 'Extra large style',
    value: {
      fontSize: '1.25rem',
      lineHeight: '1.75rem',
    },
  },
  '2xl': {
    description: '2x large style',
    value: {
      fontSize: '1.5rem',
      lineHeight: '2rem',
    },
  },
  '3xl': {
    description: '3x large style',
    value: {
      fontSize: '1.875rem',
      lineHeight: '2.25rem',
    },
  },
  '4xl': {
    description: '4x large style',
    value: {
      fontSize: '2.25rem',
      lineHeight: '2.5rem',
    },
  },
});
