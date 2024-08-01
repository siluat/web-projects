import { defineConfig } from '@pandacss/dev'
import { colors } from '~/panda/tokens'

export default defineConfig({
  preflight: true,
  minify: true,
  hash: true,
  outdir: './src/styled-system',
  include: ['./src/**/*.{ts,tsx,astro}'],
  exclude: [],
  theme: {
    extend: {
      tokens: {
        colors,
      },
    },
  },
})
