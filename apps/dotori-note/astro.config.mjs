import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';
import { remarkModifiedTime } from './src/astro-plugins/remark-modified-time.mjs';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx(), partytown()],
  markdown: {
    remarkPlugins: [remarkModifiedTime],
  },
});
