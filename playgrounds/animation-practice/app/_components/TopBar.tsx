import { SidebarTrigger } from '@siluat/shadcn-ui/components/sidebar';
import { ThemeToggle } from './ThemeToggle';

export function TopBar() {
  return (
    <section className="flex justify-between items-center gap-2 p-1">
      <SidebarTrigger />
      <ThemeToggle />
    </section>
  );
}
