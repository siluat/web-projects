import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="mb-4 text-4xl font-bold">Color Contrast</h1>
      <p className="mb-8 max-w-lg text-fd-muted-foreground">
        Zero-dependency WCAG color contrast computation for JavaScript and
        TypeScript.
      </p>
      <div className="flex gap-4">
        <Link
          href="/docs/guides/getting-started"
          className="rounded-lg bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground"
        >
          Getting Started
        </Link>
        <Link
          href="https://github.com/siluat/web-projects/tree/main/packages/color-contrast"
          className="rounded-lg border border-fd-border px-4 py-2 text-sm font-medium"
        >
          GitHub
        </Link>
      </div>
    </main>
  );
}
