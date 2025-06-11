import { FaGithub } from 'react-icons/fa';
import { PiCoffee as CoffeeIcon } from 'react-icons/pi';

import { OnlineUsers } from '@/app/retro/[id]/components/OnlineUsers';
import { ChatButton } from './ChatButton';
import { LogoSection } from './LogoSection';
import { SwitchColorMode } from './SwitchColorMode';
import { Button } from './ui/button';

export function Navigation() {
  return (
    <div>
      <div className="flex items-center justify-between border-b bg-neutral-50 px-4 py-1.5 dark:border-neutral-900 dark:bg-neutral-900">
        <LogoSection />
        <div className="flex items-center gap-2">
          <OnlineUsers />
          <ChatButton />
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

          <SwitchColorMode />
          <a
            href="https://github.com/jorgepedraza88/snapretro"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub size={20} className="text-violet-500 dark:text-violet-400" />
          </a>
        </div>
      </div>
    </div>
  );
}
