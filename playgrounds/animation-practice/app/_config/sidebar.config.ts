interface Workspace {
  name: string;
  pathname: string;
  groups: WorkspaceItemGroup[];
}

interface WorkspaceItemGroup {
  name: string;
  items: WorkspaceItem[];
}

interface WorkspaceItem {
  name: string;
  href: string;
}

interface SidebarConfig {
  workspaces: Workspace[];
}

export const sidebarConfig: SidebarConfig = {
  workspaces: [
    {
      pathname: 'animation-on-the-web',
      name: 'Animation on the Web by Emil',
      groups: [
        {
          name: 'CSS Animations',
          items: [
            {
              name: 'Stacked Component',
              href: '/animation-on-the-web/stacked-component',
            },
          ],
        },
      ],
    },
  ],
};
