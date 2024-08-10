import { defineCollection, z } from 'astro:content'

const contentScheme = z.object({
  title: z.string(),
})

export const collections = {
  /**
   * 도토리 노트에 대한 기록
   */
  dotori: defineCollection({
    type: 'content',
    schema: contentScheme,
  }),
}
