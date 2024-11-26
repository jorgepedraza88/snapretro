import { RetroCardGroup } from "@/components/retro-card-group";
import { HiClock as TimerIcon } from "react-icons/hi2";

export default function Page() {
  return (
    <div className="max-w-5xl mx-auto flex flex-col justify-center items-center w-full p-16">
      <div className="bg-green-300 rounded-lg px-2 py-1 mb-2 flex items-center gap-2 text-gray-800">
        <TimerIcon size={16} /> 04:33
      </div>
      <RetroCardGroup />
    </div>
  );
}
