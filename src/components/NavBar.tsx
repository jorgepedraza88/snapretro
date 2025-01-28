import Link from "next/link";

import { SwitchColorMode } from "./SwitchColorMode";

export function NavBar() {
  return (
    <div className="flex justify-between px-4 py-2 shadow items-center bg-neutral-50 dark:bg-neutral-900 border-b dark:border-neutral-900">
      <div>
        <Link
          className="font-black text-lg text-violet-600 dark:text-neutral-100"
          href="/"
        >
          FreeRetros
        </Link>
        <span className="ml-4 text-violet-500 text-sm italic">Beta</span>
      </div>
      <div className="flex items-center gap-2">
        <SwitchColorMode />
        <p className="text-sm font-semibold dark:text-neutral-100">
          Buy me a coffee!
        </p>
      </div>
    </div>
  );
}
