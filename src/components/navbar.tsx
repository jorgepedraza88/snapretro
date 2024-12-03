import Link from "next/link";

export function NavBar() {
  return (
    <div className="flex justify-between px-4 py-2 shadow items-center">
      <div>
        <Link className="font-bold" href="/">
          OpenRetros
        </Link>
      </div>
      <div>
        <p className="text-sm font-semibold">Buy me a coffee!</p>
      </div>
    </div>
  );
}
