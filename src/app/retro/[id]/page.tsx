import { redirect } from "next/navigation";

import CountdownTimer from "@/components/countdown-timer";
import { RetroCardGroup } from "@/components/retro-card-group";
import { RetrospectiveData } from "@/types/Retro";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const retrospectiveId = (await params).id;
  const response = await fetch(
    `http://localhost:3005/retrospectives/${retrospectiveId}`,
  );

  if (!response.ok) {
    redirect("/not-found");
  }

  const retroSpectiveData: RetrospectiveData = await response.json();

  return (
    <div className="max-w-5xl mx-auto flex flex-col justify-center items-center w-full p-16">
      <CountdownTimer defaultSeconds={retroSpectiveData.timer} />
      <RetroCardGroup retroSpectiveData={retroSpectiveData} />
    </div>
  );
}
