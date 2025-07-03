import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import rehypeAutolinkHeadings, {
  type Options as RehypeAutolinkHeadingsOptions,
} from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';

const rehypeAutolinkHeadingsOptions: RehypeAutolinkHeadingsOptions = {
  behavior: 'wrap',
  properties: {
    className: [
      'autolink-heading',
      'no-underline',
      'hover:underline',
      'hover:underline-offset-4',
      'hover:before:inline-block',
      'hover:before:content-["#"]',
      'hover:before:w-[0.7em]',
      'hover:before:ml-[-0.7em]',
    ],
    ariaLabel: 'Link to this heading',
    tabindex: 0,
  },
};

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(), // React should come first as MDX depends on it
    mdx(),
    partytown(),
  ],
  markdown: {
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, rehypeAutolinkHeadingsOptions],
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
