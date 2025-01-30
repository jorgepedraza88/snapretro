import { RetroCardGroup } from "@/components/RetroCardGroup";
import { Timer } from "@/components/Timer";
import { AdminMenu } from "./components/AdminMenu";
import { EndRetroContainer } from "./components/EndRetroContainer";
import { type RetrospectiveData } from "@/types/Retro";

export function MainContent({ data }: { data: RetrospectiveData }) {
  const { timer, status } = data;

  const shouldDisplayTimer = timer && status === "active";
  const shouldDiplayRetroCards = status === "active";

  return (
    <div className="max-w-6xl mx-auto flex flex-col items-center p-8 size-full relative">
      {shouldDisplayTimer && <Timer defaultSeconds={timer} />}
      {shouldDiplayRetroCards && <RetroCardGroup retrospectiveData={data} />}
      <EndRetroContainer />
      <AdminMenu retrospectiveData={data} />
    </div>
  );
}
