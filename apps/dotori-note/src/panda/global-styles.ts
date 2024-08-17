import { defineGlobalStyles } from '@pandacss/dev'
import { themeAttributes } from './theme-utils'

export const globalCss = defineGlobalStyles({
  body: {
    fontFamily: 'Noto Sans KR Variable',
  },
  [themeAttributes.light]: {
    color: 'gray12',
    bgColor: 'gray1',
  },
  [themeAttributes.dark]: {
    color: 'grayDark12',
    bgColor: 'grayDark1',
  },
})
