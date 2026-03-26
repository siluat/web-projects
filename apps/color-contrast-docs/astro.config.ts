import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Color Contrast',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/siluat/web-projects/tree/main/packages/color-contrast',
        },
      ],
      sidebar: [
        {
          label: 'Guides',
          items: [{ slug: 'guides/getting-started' }],
        },
        {
          label: 'Reference',
          items: [{ slug: 'reference/library-api' }, { slug: 'reference/cli' }],
        },
      ],
    }),
  ],
});
