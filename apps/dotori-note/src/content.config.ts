import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './notes' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()),
    created: z.date(),
    modified: z.date().optional(),
  }),
});

const bookReviews = defineCollection({
  loader: glob({ pattern: 'book-reviews.json', base: './collection/reviews' }),
  schema: z.record(
    z.string(),
    z.object({
      title: z.string(),
      author: z.string(),
      publisher: z.string(),
      link: z.string().optional(),
      reviews: z.array(z.string()),
    }),
  ),
});

export const collections = { notes, bookReviews };
