import { redirect } from 'next/navigation';

import { Navigation } from '@/components/Navigation';
import { UserSessionWrapper } from '@/components/UserSessionWrapper';
import { getRetrospetiveData } from '@/app/actions';
import { RetroContextProvider } from './components/RetroContextProvider';
import { MainContent } from './MainContent';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const retrospectiveId = (await params).id;
  // TODO: Fix type
  const initialData = (await getRetrospetiveData(retrospectiveId)) as any;

  if (!initialData) {
    redirect('/not-found');
  }

  return (
    <UserSessionWrapper data={initialData}>
      <RetroContextProvider data={initialData}>
        <Navigation />
        <div className="gap-2 bg-neutral-50 lg:flex">
          <MainContent data={initialData} />
        </div>
      </RetroContextProvider>
    </UserSessionWrapper>
  );
}
