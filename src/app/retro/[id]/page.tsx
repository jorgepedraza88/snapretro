'use client';

import { ImSpinner as SpinnerIcon } from 'react-icons/im';
import { useParams, useRouter } from 'next/navigation';

import { useRetrospectiveQuery } from '@/hooks/api/query/useRetrospectiveQuery';
import { Navigation } from '@/components/Navigation';
import { UserSessionWrapper } from '@/components/UserSessionWrapper';
import { RetroContextProvider } from './components/RetroContextProvider';
import { MainContent } from './MainContent';
import { MainContentWrapper } from './MainContentWrapper';

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading, isError } = useRetrospectiveQuery(id);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <SpinnerIcon className="animate-spin text-4xl text-violet-700" />
      </div>
    );
  }

  if (isError) {
    router.push('/not-found');
  }

  if (!data) {
    return null;
  }

  return (
    <UserSessionWrapper data={data}>
      <RetroContextProvider data={data}>
        <Navigation />
        <MainContentWrapper>
          <MainContent data={data} />
        </MainContentWrapper>
      </RetroContextProvider>
    </UserSessionWrapper>
  );
}
