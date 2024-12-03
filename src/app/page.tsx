import { Button } from "@/components/ui/button";
import {
  HiOutlineUserPlus as JoinIcon,
  HiOutlineUserGroup as CreateRetroIcon,
} from "react-icons/hi2";

export default function Home() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)] h-screen flex flex-col justify-center">
      <main className="flex flex-col justify-center items-center">
        <h1 className="text-6xl font-bold">Welcome to OpenRetros</h1>
        <div className="flex justify-center max-w-96 mt-8 gap-4 items-center">
          <Button>
            <CreateRetroIcon size={24} />
            Start a new retrospective
          </Button>
          <Button size="lg" variant="outline">
            <JoinIcon size={24} />
            Join into a retrospective
          </Button>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}
