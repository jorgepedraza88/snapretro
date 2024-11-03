import { UserDropdown } from "./user-dropdown";

export function NavBar() {
  return (
    <div className="flex justify-between px-4 py-2 shadow items-center">
      <div>
        <span className="font-bold">OpenRetros</span>
      </div>
      <div>
        <UserDropdown />
      </div>
    </div>
  );
}
