import { EndRetroDialog } from "@/app/retro/[id]/components/EndRetroDialog";
import Link from "next/link";

// import { SwitchColorMode } from "./SwitchColorMode";

export function Navigation() {
  return (
    <div>
      <div className="text-sm py-1 border-b text-center w-full bg-violet-100 text-violet-900">
        This app is still in development - It may contains some issues
      </div>
      <div className="flex justify-between px-4 py-1.5 items-center bg-neutral-50 dark:bg-neutral-900 border-b dark:border-neutral-900">
        <div>
          <Link
            className="font-black text-lg text-violet-600 dark:text-neutral-100"
            href="/"
          >
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
