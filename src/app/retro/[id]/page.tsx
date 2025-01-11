import { redirect } from "next/navigation";

import { CountdownTimer } from "@/components/CountdownTimer";
import { RetroCardGroup } from "@/components/retro-card-group";
import { Footer } from "@/components/footer";
import { RetroProtectedWrapper } from "./retro-protected-wrapper";
import { EndRetroDialog } from "./components/end-retro-dialog";
import { Participants } from "./components/participants";
import { prisma } from "@/lib/prisma";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const retrospectiveId = (await params).id;

  const retrospectiveData = await prisma.retrospective.findUnique({
    where: { id: retrospectiveId },
    include: {
      sections: {
        include: {
          posts: true, // Include nested posts for each section
        },
        orderBy: { sortOrder: "asc" }, // Explicitly order sections by sortOrder
      },
    },
  });

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
        <div className="max-w-6xl mx-auto flex flex-col items-center w-full p-8 h-full">
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
