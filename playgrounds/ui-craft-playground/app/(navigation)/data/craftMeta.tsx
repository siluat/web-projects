import { FfxivJobIconsLoopUsingFlubber } from '@siluat/ui-craft/react/ffxiv-job-icons-loop-using-flubber';
import { FfxivJobIconsLoopUsingGooeyEffect } from '@siluat/ui-craft/react/ffxiv-job-icons-loop-using-gooey-effect';

interface CraftMeta {
  name: string;
  component: React.ReactNode;
}

export const craftMetaMap = new Map<string, CraftMeta>([
  [
    'ffxiv-job-icon-loop-using-flubber',
    {
      name: 'FFXIV Job Icons Loop (flubber)',
      component: <FfxivJobIconsLoopUsingFlubber />,
    },
  ],
  [
    'ffxiv-job-icon-loop-using-gooey-effect',
    {
      name: 'FFXIV Job Icons Loop (gooey)',
      component: <FfxivJobIconsLoopUsingGooeyEffect />,
    },
  ],
]);
