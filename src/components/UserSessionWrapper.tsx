'use client';

import { useRouter } from 'next/navigation';

import { RetrospectiveData } from '@/types/Retro';
import { ROUTES } from '@/constants/routes';
import { usePresenceStore } from '@/stores/usePresenceStore';
import { NewUserDialog } from './NewUserDialog';

interface UserSessionWrapperProps {
  data: RetrospectiveData;
  children: React.ReactNode;
}

export function UserSessionWrapper({ data, children }: UserSessionWrapperProps) {
  const router = useRouter();
  const currentUser = usePresenceStore((state) => state.currentUser);
  const isGuestUser = currentUser.id === 'guest';
  const hasBeenDisconnected = currentUser.hasBeenDisconnected;
  const hasRetroEnded = data.status === 'ended';

  if (hasBeenDisconnected) {
    router.replace(ROUTES.DISCONNECTED);
  }

  if (hasRetroEnded) {
    router.replace(ROUTES.NOT_FOUND);
  }

  // If there is no user session and the user is trying to access a retro meeting
  if (isGuestUser) {
    return <NewUserDialog data={data} />;
  }

  return children;
}
