import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  preflight: true,
  include: ['./src/**/*.{ts,tsx,js,jsx,astro}'],
  exclude: [],
  outdir: 'styled-system',
})
