import { redirect } from 'next/navigation';

import { ChatFooter } from '@/components/ChatFooter';
import { Navigation } from '@/components/Navigation';
import { UserSessionWrapper } from '@/components/UserSessionWrapper';
import { getRetrospetiveData } from '@/app/actions';
import { OnlineUsers } from './components/OnlineUsers';
import { RetroContextProvider } from './components/RetroContextProvider';
import { MainContent } from './MainContent';

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
        <div className="gap-2 bg-neutral-50 lg:flex">
          <MainContent data={initialData} />
          <ChatFooter />
        </div>
      </RetroContextProvider>
    </UserSessionWrapper>
  );
}
