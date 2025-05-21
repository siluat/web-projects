import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    lastModified: z.date(),
  }),
});

export const collections = { notes };
