import { FaGithub } from 'react-icons/fa';
import { PiCoffee as CoffeeIcon } from 'react-icons/pi';

import { OnlineUsers } from '@/app/retro/[id]/components/OnlineUsers';
import { ChatButton } from './ChatButton';
import { LogoSection } from './LogoSection';
import { ShareButton } from './ShareButton';
import { SwitchColorMode } from './SwitchColorMode';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function Navigation() {
  return (
    <div>
      <div className="flex items-center justify-between border-b bg-neutral-50 px-4 py-1.5 dark:border-neutral-900 dark:bg-neutral-900">
        <LogoSection />
        <div className="flex items-center gap-2">
          <ShareButton />
          <OnlineUsers />
          <ChatButton />
          <SwitchColorMode />

          <div className="mx-2 h-4 w-px bg-violet-500" />
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href="https://www.buymeacoffee.com/jorgepedraza"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-violet-500 dark:text-violet-400"
                    >
                      <CoffeeIcon size={24} className="shrink-0" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-violet-500 text-violet-50 dark:bg-violet-900 dark:text-violet-50">
                  Buy me a Coffee!
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://github.com/jorgepedraza88/snapretro"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaGithub size={24} className="shrink-0 text-violet-500 dark:text-violet-400" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
