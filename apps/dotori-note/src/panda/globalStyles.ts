import { defineGlobalStyles } from '@pandacss/dev'
import { themeAttributes } from './theme'

export const globalCss = defineGlobalStyles({
  [themeAttributes.light]: {
    color: 'gray12',
    bgColor: 'gray1',
  },
  [themeAttributes.dark]: {
    color: 'grayDark12',
    bgColor: 'grayDark1',
  },
})
