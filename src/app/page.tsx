import { HiOutlineUserGroup as CreateRetroIcon } from 'react-icons/hi2';
import Link from 'next/link';

import { JoinRetroButton } from '@/components/JoinRetroButton';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

// import { SwitchColorMode } from "@/components/SwitchColorMode";

export default function Home() {
  return (
    <div className="relative flex h-screen flex-col justify-center bg-gray-50 p-4 font-[family-name:var(--font-geist-sans)] dark:bg-neutral-800">
      {/* <div className="absolute top-4 right-4">
        <SwitchColorMode />
      </div> */}
      <main className="flex flex-col items-center justify-center">
        <h1 className="text-center text-5xl leading-tight tracking-tight dark:text-neutral-100 lg:text-left lg:text-8xl">
          Welcome to <span className="font-semibold text-violet-700">FreeRetros</span>
        </h1>
        <h2 className="mt-2 text-xl tracking-tight dark:text-neutral-100 lg:text-5xl">
          A free tool for creating retrospectives
        </h2>
        <div className="mt-8 max-w-96 items-center justify-center gap-4 lg:flex">
          <Button size="lg" className="mb-2 w-full lg:mb-0 lg:w-auto" asChild>
            <Link href={ROUTES.CREATE_RETRO}>
              <CreateRetroIcon size={24} />
              Start a new retrospective
            </Link>
          </Button>
          <JoinRetroButton />
        </div>
      </main>
      <footer className="row-start-3 flex flex-wrap items-center justify-center gap-6"></footer>
    </div>
  );
}
