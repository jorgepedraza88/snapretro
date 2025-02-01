import Link from 'next/link';

import { EndRetroDialog } from '@/app/retro/[id]/components/EndRetroDialog';

// import { SwitchColorMode } from "./SwitchColorMode";

export function Navigation() {
  return (
    <div>
      <div className="w-full border-b bg-violet-100 py-1 text-center text-sm text-violet-900">
        This app is still in development - It may contain some issues
      </div>
      <div className="flex items-center justify-between border-b bg-neutral-50 px-4 py-1.5 dark:border-neutral-900 dark:bg-neutral-900">
        <div>
          <Link className="text-lg font-black text-violet-600 dark:text-neutral-100" href="/">
            FreeRetros
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <EndRetroDialog />
          {/* <SwitchColorMode /> */}
          {/* <p className="text-sm font-semibold dark:text-neutral-100">
          Buy me a coffee!
        </p> */}
        </div>
      </div>
    </div>
  );
}
