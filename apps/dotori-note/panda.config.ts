import { defineConfig } from '@pandacss/dev'
import { globalCss } from '~/panda/globalStyles'
import { themeConditions } from '~/panda/theme'
import { colors } from '~/panda/tokens'

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
    },
  },
})
