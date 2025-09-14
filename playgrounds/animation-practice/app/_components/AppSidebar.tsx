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
import { useMemo, useState } from 'react';
import { sidebarConfig } from '../_config/sidebar.config';

export function AppSidebar() {
  const { setOpenMobile } = useSidebar();

  const [selectedWorkspaceName, setSelectedWorkspaceName] = useState<
    string | undefined
  >(sidebarConfig.workspaces[0]?.name);

  const workspace = useMemo(() => {
    return sidebarConfig.workspaces.find(
      (workspace) => workspace.name === selectedWorkspaceName,
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
                    <span className="">
                      {selectedWorkspaceName ?? 'No workspace selected'}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width)"
                align="start"
              >
                {sidebarConfig.workspaces.map((workspace) => (
                  <DropdownMenuItem
                    key={workspace.name}
                    onSelect={() => setSelectedWorkspaceName(workspace.name)}
                  >
                    {workspace.name}
                    {workspace.name === selectedWorkspaceName && (
                      <Check className="ml-auto" />
                    )}
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
