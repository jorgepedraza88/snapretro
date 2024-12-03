import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Page() {
  return (
    <div className="max-w-5xl mx-auto flex flex-col justify-center items-center w-full p-16 h-screen">
      <p className="mb-2">😓 Ups! This retrospective session does not exist.</p>
      <Button asChild>
        <Link href="/">Back</Link>
      </Button>
    </div>
  );
}
