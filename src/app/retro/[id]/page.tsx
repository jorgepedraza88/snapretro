import CountdownTimer from "@/components/countdown-timer";
import { RetroCardGroup } from "@/components/retro-card-group";

export default async function Page() {
  return (
    <div className="max-w-5xl mx-auto flex flex-col justify-center items-center w-full p-16">
      <CountdownTimer />
      <RetroCardGroup />
    </div>
  );
}
