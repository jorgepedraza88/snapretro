import Link from "next/link";
import { HiOutlineUserGroup as CreateRetroIcon } from "react-icons/hi2";

import { JoinRetroButton } from "@/components/join-retro-button";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)] h-screen flex flex-col justify-center">
      <main className="flex flex-col justify-center items-center">
        <h1 className="text-6xl font-bold">
          Welcome to{" "}
          <span className="text-violet-700 font-black">FreeRetros</span>
        </h1>
        <h2 className="text-2xl mt-2">
          A free tool for creating retrospectives
        </h2>
        <div className="flex justify-center max-w-96 mt-8 gap-4 items-center">
          <Button size="lg" asChild>
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
