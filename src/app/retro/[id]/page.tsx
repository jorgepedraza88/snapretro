import { redirect } from "next/navigation";

import { CountdownTimer } from "@/components/CountdownTimer";
import { RetroCardGroup } from "@/components/RetroCardGroup";
import { Footer } from "@/components/Footer";
import { RetroProtectedWrapper } from "./RetroProtectedWrapper";
import { Participants } from "./components/Participants";

import { getRetrospetiveData } from "@/app/actions";
import { EndRetroContainer } from "./components/EndRetroContainer";
import { AdminMenu } from "./components/AdminMenu";
import { RetroContextProvider } from "./components/RetroContextProvider";
import { NavBar } from "@/components/NavBar";

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
  const shouldDiplayRetroCards = status === "active";

  return (
    <RetroProtectedWrapper
      adminId={adminId}
      passwordEnabled={enablePassword}
      retroPassword={password}
    >
      <RetroContextProvider retrospectiveData={retrospectiveData}>
        <NavBar />
        <div className="lg:flex gap-2">
          <div className="min-w-60 h-screen">
            <Participants />
          </div>
          <div className="max-w-6xl mx-auto flex flex-col items-center p-8 size-full relative">
            {shouldDisplayTimer && (
              <CountdownTimer defaultSeconds={timer} adminId={adminId} />
            )}
            {shouldDiplayRetroCards && (
              <RetroCardGroup retrospectiveData={retrospectiveData} />
            )}
            <EndRetroContainer />
            <AdminMenu retrospectiveData={retrospectiveData} />
          </div>
        </div>
        {enableChat && <Footer />}
      </RetroContextProvider>
    </RetroProtectedWrapper>
  );
}
