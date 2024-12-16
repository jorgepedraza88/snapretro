import { redirect } from "next/navigation";

import CountdownTimer from "@/components/countdown-timer";
import { RetroCardGroup } from "@/components/retro-card-group";
import { RetrospectiveData } from "@/types/Retro";
import { Footer } from "@/components/footer";

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

  const isCurrentUserAdmin = true;

  // guardar en el localStorage el user id creado para la sesión del creador del retro. Al entrar en la retro, checkeamos
  // el localStorage. Si el user id coíncide con el adminID del retro, entonces es admin.

  return (
    <div className="max-w-5xl mx-auto flex flex-col  items-center w-full p-16 h-full">
      <CountdownTimer
        defaultSeconds={retroSpectiveData.timer}
        isCurrentUserAdmin={isCurrentUserAdmin}
      />
      <RetroCardGroup retroSpectiveData={retroSpectiveData} />
      {retroSpectiveData.enableChat && <Footer />}
    </div>
  );
}
