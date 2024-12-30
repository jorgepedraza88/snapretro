import Link from "next/link";

export function NavBar() {
  return (
    <div className="flex justify-between px-4 py-2 shadow items-center bg-neutral-50 border-b">
      <div>
        <Link className="font-black text-lg text-violet-700" href="/">
          FreeRetros
        </Link>
      </div>
      <div>
        <p className="text-sm font-semibold">Buy me a coffee!</p>
      </div>
    </div>
  );
}
