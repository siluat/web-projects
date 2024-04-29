import { defineGlobalStyles } from '@pandacss/dev'
import { themeRootClassName } from './custom-utils'

export const globalStyles = defineGlobalStyles({
  body: {
    color: 'text',
    bg: 'background',
  },
  [`.${themeRootClassName}`]: {
    color: 'text',
    bg: 'background',
  },
})
