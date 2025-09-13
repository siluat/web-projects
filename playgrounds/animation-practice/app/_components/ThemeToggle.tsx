'use client';

import { Button } from '@siluat/shadcn-ui/components/button';
import { SunMoon } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8"
      onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
    >
      <SunMoon />
    </Button>
  );
}
