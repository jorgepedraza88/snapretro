'use client';

import { RetrospectiveData } from '@/types/Retro';
import { usePresenceStore } from '@/stores/usePresenceStore';
import { NewUserDialog } from './NewUserDialog';

interface UserSessionWrapperProps {
  data: RetrospectiveData;
  children: React.ReactNode;
}

export function UserSessionWrapper({ data, children }: UserSessionWrapperProps) {
  const currentUser = usePresenceStore((state) => state.currentUser);
  const isGuestUser = currentUser.id === 'guest';

  // If there is no user session and the user is trying to access a retro meeting
  if (isGuestUser) {
    return <NewUserDialog data={data} />;
  }

  return children;
}
