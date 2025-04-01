import type { CollectionEntry } from 'astro:content';

interface Note {
  slug: string;
  title: string;
  lastModified: Date;
}

export async function getNormalizedNote(
  entry: CollectionEntry<'note'>,
): Promise<Note> {
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
