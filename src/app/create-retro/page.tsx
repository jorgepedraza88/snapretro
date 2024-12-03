import Link from "next/link";
import { CreateRetroForm } from "./components/create-retro-form";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)] h-screen flex justify-center">
      <div className="py-24">
        <h1 className="text-4xl font-medium">Create your Retrospective</h1>
        <main className="flex flex-col justify-center items-center max-w-2xl">
          <CreateRetroForm />
          <div className="text-xs text-gray-500 mt-8">
            Don&apos;t want to create a retrospective?
            <Button variant="link" className="text-sm" asChild>
              <Link href="/">Go to main</Link>
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
