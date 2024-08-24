import { defineGlobalStyles } from '@pandacss/dev'
import { themeAttributes } from './theme-utils'

export const globalCss = defineGlobalStyles({
  body: {
    fontFamily: 'Noto Sans KR Variable',
    textStyle: 'base',
    wordBreak: 'keep-all',
  },
  [themeAttributes.light]: {
    color: 'gray12',
    bgColor: 'gray1',
  },
  [themeAttributes.dark]: {
    color: 'grayDark12',
    bgColor: 'grayDark1',
  },
  'h1, h2, h3, h4, h5, h6': {
    fontWeight: 'bold',
  },
  h6: {
    textStyle: 'base',
    mt: '2rem',
    mb: '0.75rem',
  },
  h5: {
    textStyle: 'lg',
    mt: '2rem',
    mb: '0.75rem',
  },
  h4: {
    textStyle: 'xl',
    mt: '2rem',
    mb: '0.75rem',
  },
  h3: {
    textStyle: '2xl',
    mt: '2rem',
    mb: '0.75rem',
  },
  h2: {
    textStyle: '3xl',
    mt: '2rem',
    mb: '0.75rem',
  },
  h1: {
    textStyle: '4xl',
    mb: '2rem',
  },
  p: {
    mb: '1rem',
    textStyle: 'base',
  },
  'ul, ol': {
    mb: '1rem',
    paddingLeft: '1.5rem',
  },
  ul: {
    listStyle: 'disc',
  },
  li: {
    mt: '0.5rem',
    mb: '0.5rem',
  },
  blockquote: {
    mt: '1rem',
    mb: '1rem',
    pt: '0.5rem',
    pl: '1rem',
    borderLeft: '4px solid',
    borderColor: 'gray6',
    _dark: {
      borderColor: 'grayDark8',
    },
  },
})
