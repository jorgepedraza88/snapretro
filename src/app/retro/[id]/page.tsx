import { redirect } from "next/navigation";

import CountdownTimer from "@/components/countdown-timer";
import { RetroCardGroup } from "@/components/retro-card-group";
import { RetrospectiveData } from "@/types/Retro";
import { Footer } from "@/components/footer";
import { RetroProtectedWrapper } from "./retro-protected-wrapper";
import { EndRetroDialog } from "./components/end-retro-dialog";
import { Participants } from "./components/participants";

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
      <div className="flex gap-2">
        <div className="min-w-60">
          <Participants adminId={retroSpectiveData.adminId} />
        </div>
        <div className="max-w-6xl mx-auto flex flex-col items-center w-full p-8 h-full">
          {retroSpectiveData.timer && (
            <CountdownTimer
              defaultSeconds={retroSpectiveData.timer}
              adminId={retroSpectiveData.adminId}
            />
          )}
          <RetroCardGroup retroSpectiveData={retroSpectiveData} />
          {retroSpectiveData.enableChat && <Footer />}
          <EndRetroDialog adminId={retroSpectiveData.adminId} />
        </div>
      </div>
    </RetroProtectedWrapper>
  );
}
