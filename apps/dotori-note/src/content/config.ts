import { defineCollection, z } from 'astro:content';

const noteScheme = z.object({
  title: z.string(),
  description: z.string().optional(),
});

export const collections = {
  note: defineCollection({
    type: 'content',
    schema: noteScheme,
  }),
};
