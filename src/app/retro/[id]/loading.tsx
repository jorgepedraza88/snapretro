import { ImSpinner as SpinnerIcon } from "react-icons/im";

export default function Loading() {
  return (
    <div className="flex justify-center items-center size-full">
      <SpinnerIcon size={50} className="animate-spin text-violet-700" />
    </div>
  );
}
