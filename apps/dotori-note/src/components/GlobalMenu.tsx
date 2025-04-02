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
  MonitorCog,
  Moon,
  SquareBottomDashedScissors,
  Squirrel,
  Sun,
} from 'lucide-react';

export function GlobalMenu() {
  const preventDefault = (event: Event) => {
    event.preventDefault();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          메뉴
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
        <DropdownMenuRadioGroup value="auto">
          <DropdownMenuLabel className="text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
            테마 설정
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioItem value="auto" onSelect={preventDefault}>
            <MonitorCog className="w-4 h-4" />
            자동
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="light"
            onSelect={preventDefault}
            disabled
          >
            <Sun className="w-4 h-4" />
            라이트
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="dark"
            onSelect={preventDefault}
            disabled
          >
            <Moon className="w-4 h-4" />
            다크
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
