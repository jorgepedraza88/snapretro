import { RetrospectiveData } from "@/types/Retro";
import { RetroCard } from "./retro-card";
import { cn } from "@/lib/utils";

export async function RetroCardGroup({
  retrospectiveData: retrospectiveData,
}: {
  retrospectiveData: RetrospectiveData;
}) {
  const sectionsNumber = retrospectiveData.sections.length;

  function getColumnNumberClass(sectionNumber: number) {
    return `grid-cols-${sectionNumber}`;
  }

  return (
    <div
      className={cn(
        "lg:grid gap-4 block space-y-4 lg:space-y-0 w-full",
        getColumnNumberClass(sectionsNumber),
      )}
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
