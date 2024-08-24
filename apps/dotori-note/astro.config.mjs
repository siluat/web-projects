import react from '@astrojs/react'
import { defineConfig } from 'astro/config'
import { remarkModifiedTime } from './src/astro-plugins/remark-modified-time.mjs'

import mdx from '@astrojs/mdx'

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx()],
  markdown: {
    remarkPlugins: [remarkModifiedTime],
  },
})
