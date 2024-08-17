import { defineConfig } from '@pandacss/dev'
import { colors } from '~/panda/color-tokens'
import { globalCss } from '~/panda/global-styles'
import { textStyles } from '~/panda/text-styles'
import { themeConditions } from '~/panda/theme-utils'

export default defineConfig({
  preflight: true,
  minify: true,
  hash: true,
  outdir: './src/styled-system',
  include: ['./src/**/*.{ts,tsx,astro}'],
  exclude: [],
  conditions: {
    extend: {
      ...themeConditions,
    },
  },
  globalCss,
  theme: {
    extend: {
      tokens: {
        colors,
      },
      textStyles,
    },
  },
})
