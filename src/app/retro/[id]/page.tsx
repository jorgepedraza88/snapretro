import { redirect } from "next/navigation";

import { CountdownTimer } from "@/components/CountdownTimer";
import { RetroCardGroup } from "@/components/retro-card-group";
import { Footer } from "@/components/footer";
import { RetroProtectedWrapper } from "./retro-protected-wrapper";
import { EndRetroDialog } from "./components/end-retro-dialog";
import { Participants } from "./components/participants";
import { prisma } from "@/lib/prisma";
import { getRetrospetiveData } from "@/app/actions";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const retrospectiveId = (await params).id;
  const retrospectiveData = await getRetrospetiveData(retrospectiveId);

  if (!retrospectiveData) {
    redirect("/not-found");
  }

  return (
    <RetroProtectedWrapper
      adminId={retrospectiveData.adminId}
      passwordEnabled={retrospectiveData.enablePassword}
      retroPassword={retrospectiveData.password}
    >
      <div className="lg:flex gap-2">
        <div className="min-w-60">
          <Participants adminId={retrospectiveData.adminId} />
        </div>
        <div className="max-w-6xl mx-auto flex flex-col items-center p-8 size-full">
          {retrospectiveData.timer && (
            <CountdownTimer
              defaultSeconds={retrospectiveData.timer}
              adminId={retrospectiveData.adminId}
            />
          )}
          <RetroCardGroup retrospectiveData={retrospectiveData} />
          {retrospectiveData.enableChat && <Footer />}
          <EndRetroDialog adminId={retrospectiveData.adminId} />
        </div>
      </div>
    </RetroProtectedWrapper>
  );
}
