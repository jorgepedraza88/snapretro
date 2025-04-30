import { redirect } from 'next/navigation';

import { Navigation } from '@/components/Navigation';
import { UserSessionWrapper } from '@/components/UserSessionWrapper';
import { getRetrospetiveData } from '@/app/actions';
import { RetroContextProvider } from './components/RetroContextProvider';
import { MainContent } from './MainContent';
import { MainContentWrapper } from './MainContentWrapper';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const retrospectiveId = (await params).id;
  const initialData = await getRetrospetiveData(retrospectiveId);

  if (!initialData) {
    redirect('/not-found');
  }

  return (
    <UserSessionWrapper data={initialData}>
      <RetroContextProvider data={initialData}>
        <Navigation />
        <MainContentWrapper>
          <MainContent data={initialData} />
        </MainContentWrapper>
      </RetroContextProvider>
    </UserSessionWrapper>
  );
}
