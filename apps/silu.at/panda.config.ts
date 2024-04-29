import { defineConfig } from '@pandacss/dev'
import { globalStyles } from '@/panda-config/global-styles'
import { semanticTokens } from '@/panda-config/sementic-tokens'
import { themeConditions } from '@/panda-config/theme-conditions'

export default defineConfig({
  conditions: {
    extend: {
      ...themeConditions,
    },
  },
  globalCss: globalStyles,
  include: ['./src/**/*.{ts,tsx,js,jsx,astro}'],
  outdir: 'styled-system',
  theme: {
    semanticTokens,
  },
})
