import { FfxivJobIconsLoopUsingFlubber } from '@siluat/ui-craft/react/ffxiv-job-icons-loop-using-flubber';
import { FfxivJobIconsLoopUsingGooeyEffect } from '@siluat/ui-craft/react/ffxiv-job-icons-loop-using-gooey-effect';
import { ListItemExpandTransition } from '@siluat/ui-craft/react/list-item-expand-transition';

interface CraftMeta {
  name: string;
  render: () => React.ReactNode;
}

export const craftMetaMap = new Map<string, CraftMeta>([
  [
    'ffxiv-job-icon-loop-using-flubber',
    {
      name: 'FFXIV Job Icons Loop (flubber)',
      render: () => <FfxivJobIconsLoopUsingFlubber />,
    },
  ],
  [
    'ffxiv-job-icon-loop-using-gooey-effect',
    {
      name: 'FFXIV Job Icons Loop (gooey)',
      render: () => <FfxivJobIconsLoopUsingGooeyEffect />,
    },
  ],
  [
    'list-item-expand-transition',
    {
      name: 'List item expand transition',
      render: () => <ListItemExpandTransition />,
    },
  ],
]);
