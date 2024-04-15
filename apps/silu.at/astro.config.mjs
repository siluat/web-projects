import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import pandacss from '@pandacss/astro'

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), pandacss()],
})
