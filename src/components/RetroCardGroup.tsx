import { RetrospectiveData } from '@/types/Retro';
import { cn } from '@/lib/utils';
import { RetroCard } from './RetroCard';

export async function RetroCardGroup({
  retrospectiveData: retrospectiveData
}: {
  retrospectiveData: RetrospectiveData;
}) {
  const sectionsNumber = retrospectiveData.sections.length;

  return (
    <div
      className={cn('block w-full gap-4 space-y-4 lg:grid lg:space-y-0', {
        'grid-cols-1': sectionsNumber === 1,
        'grid-cols-2': sectionsNumber === 2,
        'grid-cols-3': sectionsNumber === 3,
        'grid-cols-4': sectionsNumber === 4
      })}
    >
      {retrospectiveData.sections.map((section) => (
        <RetroCard
          key={section.id}
          title={section.title}
          section={section}
          retrospectiveData={retrospectiveData}
        />
      ))}
    </div>
  );
}
