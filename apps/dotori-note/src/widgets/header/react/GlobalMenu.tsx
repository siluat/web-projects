'use client';

import { Button } from '@siluat/shadcn-ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@siluat/shadcn-ui/components/dropdown-menu';
import {
  CircleHelp,
  Menu,
  MonitorCog,
  Moon,
  SquareBottomDashedScissors,
  Squirrel,
  Sun,
} from 'lucide-react';
import { useState } from 'react';
import { useThemeSetting } from './use-theme-setting';

export function GlobalMenu() {
  const [open, setOpen] = useState(false);
  const { currentThemeSetting, switchThemeSetting, ThemeSetting } =
    useThemeSetting();

  return (
    /**
     * @note iOS Safari v18.3.2 및 특정 인 앱 브라우저에서 트리거가 정상 동작하지 않아 open을 직접 제어 (Astro에서만 발생하는 문제일 수도 있음)
     */
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Global Menu"
          variant="outline"
          className="cursor-pointer dark:bg-zinc-900"
          onClick={() => setOpen(!open)}
        >
          <Menu className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
            바로가기
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href="/ui-craft">
              <SquareBottomDashedScissors className="w-4 h-4" />
              UI Craft
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
            안내
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href="/note/0939ab2c-f2ac-4eab-856f-9c75058a35bd">
              <CircleHelp className="w-4 h-4" />
              도토리 노트는?
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="/note/b9a1a70c-97a8-4647-8a3c-fc3c23f2b76d">
              <Squirrel className="w-4 h-4" />
              도토리 노트 주인 소개
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={currentThemeSetting}>
          <DropdownMenuLabel className="text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
            테마 설정
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioItem
            value={ThemeSetting.Auto}
            onSelect={() => switchThemeSetting(ThemeSetting.Auto)}
          >
            <MonitorCog className="w-4 h-4" />
            자동
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value={ThemeSetting.Light}
            onSelect={() => switchThemeSetting(ThemeSetting.Light)}
          >
            <Sun className="w-4 h-4" />
            라이트
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value={ThemeSetting.Dark}
            onSelect={() => switchThemeSetting(ThemeSetting.Dark)}
          >
            <Moon className="w-4 h-4" />
            다크
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
