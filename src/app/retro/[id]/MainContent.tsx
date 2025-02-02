import { type RetrospectiveData } from '@/types/Retro';
import { RetroCardGroup } from '@/components/RetroCardGroup';
import { Timer } from '@/components/Timer';
import { AdminMenu } from './components/AdminMenu';
import { EndRetroContainer } from './components/EndRetroContainer';

export function MainContent({ data }: { data: RetrospectiveData }) {
  const { timer, status } = data;

  const shouldDisplayTimer = timer && status === 'active';
  const shouldDiplayRetroCards = status === 'active';

  return (
    <div className="relative mx-auto flex size-full flex-col items-center p-8">
      {shouldDisplayTimer && <Timer defaultTime={timer} />}
      {shouldDiplayRetroCards && <RetroCardGroup retrospectiveData={data} />}
      <EndRetroContainer />
      <AdminMenu retrospectiveData={data} />
    </div>
  );
}
