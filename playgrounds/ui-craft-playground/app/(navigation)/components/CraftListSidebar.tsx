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
} from '@siluat/shadcn-ui/components/sidebar';
import Link from 'next/link';
import { useMemo } from 'react';
import { craftMetaMap } from '../data/craftMeta';

export function CraftListSidebar() {
  const craftEntries = useMemo(() => Array.from(craftMetaMap.entries()), []);
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>ui-crafts</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {craftEntries.map(([id, craft]) => (
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
