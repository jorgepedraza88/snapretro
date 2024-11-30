import { RetrospectiveData } from "@/types/Retro";
import { RetroCard } from "./retro-card";

export async function RetroCardGroup({
  retroSpectiveData,
}: {
  retroSpectiveData: RetrospectiveData;
}) {
  return (
    <div className="md:grid grid-cols-3 gap-4 block space-y-4 md:space-y-0">
      {retroSpectiveData.sections.map((section) => (
        <RetroCard key={section.id} title={section.title} section={section} />
      ))}
    </div>
  );
}
