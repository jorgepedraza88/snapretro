import { HiOutlineUserGroup as CreateRetroIcon } from 'react-icons/hi2';
import Image from 'next/image';
import Link from 'next/link';

import { JoinRetroButton } from '@/components/JoinRetroButton';
import { LogoSection } from '@/components/LogoSection';
import { SwitchColorMode } from '@/components/SwitchColorMode';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import scrumSvg from '../../public/scrum.svg';
import teamSvg from '../../public/team-up.svg';

export default function Home() {
  return (
    <div className="relative flex h-screen flex-col justify-center overflow-hidden bg-gray-50 p-8 font-[family-name:var(--font-geist-sans)] dark:bg-neutral-800 lg:p-4">
      <div className="absolute left-6 top-4 flex items-center gap-2">
        <LogoSection />
        <SwitchColorMode />
      </div>
      <main className="flex flex-col items-center justify-center">
        <Image
          className="absolute -right-14 top-20 w-[200px] rotate-6 opacity-90 lg:-right-32 lg:top-10 lg:w-[400px]"
          src={scrumSvg}
          alt="create retrospetives meeting for free"
        />
        <Image
          className="absolute -left-6 bottom-16 hidden w-[300px] -rotate-6 opacity-90 lg:block"
          src={teamSvg}
          alt="team up to create retrospetives meeting for free"
        />
        <h1 className="z-10 text-center text-3xl leading-tight tracking-tight dark:text-neutral-100 lg:text-left lg:text-8xl">
          Create, share, and grow
        </h1>
        <h2 className="text-lg tracking-tight text-neutral-500 dark:text-neutral-100 lg:my-2 lg:text-5xl">
          The easiest way to run retrospectives
        </h2>
        <h3 className="text-l mt-2 tracking-tight dark:text-neutral-100 lg:mt-4 lg:text-2xl">
          Quick, secure, and no sign-up required.
        </h3>
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
