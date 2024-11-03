import { UserDropdown } from "./user-dropdown";

export function NavBar() {
  return (
    <div className="flex justify-between p-4 shadow items-center">
      <div>
        <span className="font-bold">OpenRetros</span></div>
      <div>
        <UserDropdown />
      </div>
    </div>
  )
}