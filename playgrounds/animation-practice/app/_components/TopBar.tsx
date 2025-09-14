import { SidebarTrigger } from '@siluat/shadcn-ui/components/sidebar';
import { ThemeToggle } from './ThemeToggle';

export const HEIGHT_OF_TOP_BAR = 35; // px

export function TopBar() {
  return (
    <section className="flex justify-between items-center gap-2 p-1">
      <SidebarTrigger />
      <ThemeToggle />
    </section>
  );
}
