import { craftMetaMap } from '@/app/(navigation)/data/craftMeta';
import { notFound } from 'next/navigation';
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const craft = craftMetaMap.get(slug);
  if (!craft) {
    notFound();
  }
  return (
    <div className="flex flex-col w-full h-full">
      <header className="flex p-4">
        <h1 className="w-full text-center">{craft.name}</h1>
      </header>
      <div className="flex flex-1 items-center justify-center">
        {craft.render()}
      </div>
    </div>
  );
}
