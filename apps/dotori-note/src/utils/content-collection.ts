import type { CollectionEntry } from 'astro:content';

interface Content {
  slug: string;
  title: string;
  lastModified: Date;
}

export async function getNormalizedContent(
  entry: CollectionEntry<'dotori'>,
): Promise<Content> {
  const { remarkPluginFrontmatter } = await entry.render();
  const lastModified = remarkPluginFrontmatter.lastModified
    ? new Date(remarkPluginFrontmatter.lastModified)
    : new Date();

  return {
    slug: entry.slug,
    title: entry.data.title,
    lastModified,
  };
}
