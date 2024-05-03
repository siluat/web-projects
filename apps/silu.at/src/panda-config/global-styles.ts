import { defineGlobalStyles } from '@pandacss/dev'

export const globalStyles = defineGlobalStyles({
  '[data-theme]': {
    color: 'text',
    bg: 'background',
  },
})
