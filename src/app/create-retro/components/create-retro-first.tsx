// import { HiPencil as EditIcon } from "react-icons/hi2";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";

export function CreateRetroFirst() {
  const { register } = useFormContext();

  return (
    <div>
      {/* <div className="w-full flex justify-center items-center">
        <Avatar className="size-40 hover:cursor-pointer relative group">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>JP</AvatarFallback>
          <div className="absolute size-full flex justify-center items-center invisible group-hover:visible group-hover:opacity-40 bg-black">
            <EditIcon size={32} className="text-white" />
          </div>
        </Avatar>
      </div> */}
      <div className="w-full text-sm space-y-1">
        <label htmlFor="name">Name</label>
        <Input
          id="name"
          placeholder="Enter your name"
          {...register("adminName")}
        />
      </div>
    </div>
  );
}
