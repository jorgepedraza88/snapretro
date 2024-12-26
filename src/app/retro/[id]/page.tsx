import { redirect } from "next/navigation";

import CountdownTimer from "@/components/countdown-timer";
import { RetroCardGroup } from "@/components/retro-card-group";
import { RetrospectiveData } from "@/types/Retro";
import { Footer } from "@/components/footer";
import { RetroProtectedWrapper } from "./retro-protected-wrapper";

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
    <RetroProtectedWrapper
      adminId={retroSpectiveData.adminId}
      passwordEnabled={retroSpectiveData.enablePassword}
      retroPassword={retroSpectiveData.password}
    >
      <div className="max-w-5xl mx-auto flex flex-col items-center w-full p-16 h-full">
        <CountdownTimer
          defaultSeconds={retroSpectiveData.timer}
          adminId={retroSpectiveData.adminId}
        />
        <RetroCardGroup retroSpectiveData={retroSpectiveData} />
        {retroSpectiveData.enableChat && <Footer />}
      </div>
    </RetroProtectedWrapper>
  );
}
