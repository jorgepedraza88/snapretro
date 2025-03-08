import { PiCoffee as CoffeeIcon } from 'react-icons/pi';
import Link from 'next/link';

import { OnlineUsers } from '@/app/retro/[id]/components/OnlineUsers';
import { ChatButton } from './ChatButton';
import { Button } from './ui/button';

// import { SwitchColorMode } from "./SwitchColorMode";

export function Navigation() {
  return (
    <div>
      <div className="w-full border-b bg-violet-100 py-1 text-center text-sm text-violet-900">
        This app is still in development - It may contain some issues
      </div>
      <div className="flex items-center justify-between border-b bg-neutral-50 px-4 py-1.5 dark:border-neutral-900 dark:bg-neutral-900">
        <div>
          <Link className="text-xl font-bold text-violet-600 dark:text-neutral-100" href="/">
            FreeRetros
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="text-sm">
            <a
              href="https://www.buymeacoffee.com/jorgepedraza"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <CoffeeIcon size={16} className="shrink-0" /> Buy me a Coffee!
            </a>
          </Button>
          <ChatButton />
          <OnlineUsers />
          {/* <SwitchColorMode /> */}
          {/* <p className="text-sm font-semibold dark:text-neutral-100">
          Buy me a coffee!
        </p> */}
        </div>
      </div>
    </div>
  );
}
