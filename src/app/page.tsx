import Link from "next/link";
import { HiOutlineUserGroup as CreateRetroIcon } from "react-icons/hi2";

import { JoinRetroButton } from "@/components/JoinRetroButton";
import { Button } from "@/components/ui/button";
// import { SwitchColorMode } from "@/components/SwitchColorMode";

export default function Home() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)] h-screen flex flex-col justify-center bg-gray-50 dark:bg-neutral-800 relative p-4">
      {/* <div className="absolute top-4 right-4">
        <SwitchColorMode />
      </div> */}
      <main className="flex flex-col justify-center items-center">
        <h1 className="text-5xl text-center lg:text-left lg:text-6xl font-bold dark:text-neutral-100">
          Welcome to{" "}
          <span className="text-violet-600 font-black">FreeRetros</span>
        </h1>
        <h2 className="text-xl lg:text-2xl mt-2 dark:text-neutral-100">
          A free tool for creating retrospectives
        </h2>
        <div className="lg:flex justify-center max-w-96 mt-8 gap-4 items-center">
          <Button size="lg" className="mb-2 lg:mb-0 w-full lg:w-auto" asChild>
            <Link href="/create-retro">
              <CreateRetroIcon size={24} />
              Start a new retrospective
            </Link>
          </Button>
          <JoinRetroButton />
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}
