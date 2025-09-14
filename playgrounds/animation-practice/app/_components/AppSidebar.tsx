'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@siluat/shadcn-ui/components/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@siluat/shadcn-ui/components/sidebar';
import { Check, ChevronsUpDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { sidebarConfig } from '../_config/sidebar.config';

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const selectedWorkspaceName = useMemo(() => {
    return pathname.split('/')[1];
  }, [pathname]);

  const workspace = useMemo(() => {
    return sidebarConfig.workspaces.find(
      (workspace) => workspace.pathname === selectedWorkspaceName,
    );
  }, [selectedWorkspaceName]);

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex flex-col gap-2 leading-none">
                    <span className="font-medium">Workspace</span>
                    <span>{workspace?.name ?? 'No workspace selected'}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width)"
                align="start"
              >
                {sidebarConfig.workspaces.map((workspace) => (
                  <DropdownMenuItem key={workspace.name} asChild>
                    <Link
                      href={`/${workspace.pathname}`}
                      className="flex w-full items-center"
                    >
                      {workspace.name}
                      {workspace.pathname === selectedWorkspaceName && (
                        <Check className="ml-auto" />
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {workspace?.groups.map((group) => (
          <SidebarGroup key={group.name}>
            <SidebarGroupLabel>{group.name}</SidebarGroupLabel>
            {group.items.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild onClick={() => setOpenMobile(false)}>
                  <Link href={item.href}>{item.name}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
