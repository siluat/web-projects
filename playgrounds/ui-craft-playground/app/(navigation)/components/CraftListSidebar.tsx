import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/shadcn-components/ui/sidebar';
import Link from 'next/link';
import { craftMetaMap } from '../data/craftMeta';

export function CraftListSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>ui-crafts</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Array.from(craftMetaMap.entries()).map(([id, craft]) => (
                <SidebarMenuItem key={id}>
                  <SidebarMenuButton asChild>
                    <Link href={`/craft/${id}`}>
                      <span>{craft.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function CraftListSidebarProvider({
  children,
}: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}

export function CraftListSidebarTrigger() {
  return <SidebarTrigger />;
}
