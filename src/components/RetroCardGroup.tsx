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
      className={cn('w-full gap-4 space-y-4 sm:grid lg:max-w-5xl lg:space-y-0 xl:max-w-7xl', {
        'grid-cols-1': sectionsNumber === 1,
        'grid-cols-2': sectionsNumber === 2,
        'grid-cols-3': sectionsNumber === 3,
        'lg:grid-cols-4': sectionsNumber === 4
      })}
    >
      {retrospectiveData.sections.map((section) => (
        <RetroCard key={section.id} title={section.title} section={section} />
      ))}
    </div>
  );
}
