import { redirect } from "next/navigation";

import { CountdownTimer } from "@/components/CountdownTimer";
import { RetroCardGroup } from "@/components/retro-card-group";
import { Footer } from "@/components/footer";
import { RetroProtectedWrapper } from "./retro-protected-wrapper";
import { EndRetroDialog } from "./components/end-retro-dialog";
import { Participants } from "./components/participants";

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

  const { adminId, enablePassword, password, timer, enableChat, status } =
    retrospectiveData;

  const shouldDisplayTimer = timer && status === "active";
  const shouldDisplayEndRetroButton = status === "active";

  return (
    <RetroProtectedWrapper
      adminId={adminId}
      passwordEnabled={enablePassword}
      retroPassword={password}
    >
      <div className="lg:flex gap-2">
        <div className="min-w-60">
          <Participants adminId={adminId} />
        </div>
        <div className="max-w-6xl mx-auto flex flex-col items-center p-8 size-full">
          {shouldDisplayTimer && (
            <CountdownTimer defaultSeconds={timer} adminId={adminId} />
          )}
          <RetroCardGroup retrospectiveData={retrospectiveData} />
          {enableChat && <Footer />}
          {shouldDisplayEndRetroButton && (
            <EndRetroDialog
              adminId={adminId}
              retrospectiveId={retrospectiveId}
            />
          )}
        </div>
      </div>
    </RetroProtectedWrapper>
  );
}
