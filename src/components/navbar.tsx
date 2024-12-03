import Link from "next/link";

export function NavBar() {
  return (
    <div className="flex justify-between px-4 py-2 shadow items-center">
      <div>
        <Link className="font-bold" href="/">
          OpenRetros
        </Link>
      </div>
      <div>Buy me a coffee!</div>
    </div>
  );
}
