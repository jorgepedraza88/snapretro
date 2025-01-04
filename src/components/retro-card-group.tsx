import { RetrospectiveData } from "@/types/Retro";
import { RetroCard } from "./retro-card";
import { cn } from "@/lib/utils";

export async function RetroCardGroup({
  retrospectiveData: retrospectiveData,
}: {
  retrospectiveData: RetrospectiveData;
}) {
  const sectionsNumber = retrospectiveData.sections.length;

  return (
    <div
      className={cn("lg:grid gap-4 block space-y-4 lg:space-y-0 w-full", {
        "grid-cols-1": sectionsNumber === 1,
        "grid-cols-2": sectionsNumber === 2,
        "grid-cols-3": sectionsNumber === 3,
        "grid-cols-4": sectionsNumber === 4,
      })}
    >
      {retrospectiveData.sections.map((section) => (
        <RetroCard
          key={section.id}
          title={section.title}
          section={section}
          adminId={retrospectiveData.adminId}
        />
      ))}
    </div>
  );
}
