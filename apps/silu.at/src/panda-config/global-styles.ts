import { defineGlobalStyles } from '@pandacss/dev'

export const globalStyles = defineGlobalStyles({
  ':root': {
    fontFamily: 'Noto Sans KR Variable, sans-serif',
  },
  '[data-theme]': {
    color: 'text',
    bg: 'background',
  },
})
