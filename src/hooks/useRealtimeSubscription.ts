'use client';

import { useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useShallow } from 'zustand/shallow';

import { type RetrospectiveData } from '@/types/Retro';
import { editRetroAdminId, revalidate } from '@/app/actions';
import REALTIME_EVENT_KEYS from '@/constants/realtimeEventKeys';
import { useAdminStore } from '@/stores/useAdminStore';
import { usePresenceStore, UserPresence } from '@/stores/usePresenceStore';
import { useRetroSummaryStore } from '@/stores/useRetroSummaryStore';
import { supabase } from '@/supabaseClient';
import { useRealtimeActions } from './useRealtimeActions';
import { useToast } from './useToast';

export const useRealtimeSubscription = (retrospectiveData: RetrospectiveData) => {
  const { toast } = useToast();
  const { setDisplayedContent } = useRetroSummaryStore();
  const { sendSymmetricKeyBroadcast } = useRealtimeActions();
  const {
    adminId,
    currentUser,
    symmetricKey,
    setAdminId,
    setCurrentUser,
    updateOnlineUsers,
    handleAdminChange,
    setChannel,
    setSymmetricKey
  } = usePresenceStore(
    useShallow((state) => ({
      currentUser: state.currentUser,
      adminId: state.adminId,
      symmetricKey: state.symmetricKey,
      setAdminId: state.setAdminId,
      setSymmetricKey: state.setSymmetricKey,
      setCurrentUser: state.setCurrentUser,
      updateOnlineUsers: state.updateOnlineUsers,
      handleAdminChange: state.handleAdminChange,
      setChannel: state.setChannel
    }))
  );
  const { setTimerState, setTimeLeft } = useAdminStore(
    useShallow((state) => ({
      setTimerState: state.setTimerState,
      setTimeLeft: state.setTimeLeft
    }))
  );

  function getPresenceActiveUsers(channel: RealtimeChannel) {
    const presenceState = channel.presenceState<UserPresence>();
    return Object.values(presenceState).flat();
  }

  function displayNewAdminToast(channel: RealtimeChannel, newAdminId: string) {
    const activeUsers = getPresenceActiveUsers(channel);
    const newAdmin = activeUsers.find((user) => user.id === newAdminId);

    const isCurrentUserAdmin = newAdmin?.id === currentUser.id;
    const toastMessage = isCurrentUserAdmin
      ? 'You are now the host'
      : `${newAdmin?.name} is now the host`;

    toast({ title: toastMessage });
  }

  useEffect(() => {
    const channel = supabase.channel(`retrospective:${retrospectiveData.id}`, {
      config: { presence: { key: currentUser.id } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const activeUsers = getPresenceActiveUsers(channel);
        updateOnlineUsers(activeUsers);

        if (!adminId) {
          setAdminId(retrospectiveData.adminId);
        }

        const currentAdmin = activeUsers.find((user) => user.id === adminId);

        // TODO: Cambiar, porque la retro no existirá cuando no haya usuarios
        if (!currentAdmin && activeUsers.length > 0) {
          // If there are users in the retrospective and there is no admin, assign the first user as admin
          handleAdminChange(activeUsers[0].id);
        }
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        const isCurrentUser = key === currentUser.id;
        const isCurrentUserAdmin = adminId === currentUser.id;

        if (symmetricKey && isCurrentUserAdmin) {
          sendSymmetricKeyBroadcast(retrospectiveData.id, symmetricKey);
        }

        if (isCurrentUser) {
          return;
        }

        toast({ title: `${newPresences[0]?.name} joined` });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        const isCurrentUser = key === currentUser.id;

        if (isCurrentUser) {
          return;
        }

        toast({ title: `${leftPresences[0]?.name} left` });
      })
      .on('broadcast', { event: REALTIME_EVENT_KEYS.ASSIGN_NEW_ADMIN }, async ({ payload }) => {
        const { newAdminId } = payload;
        await handleAdminChange(newAdminId);
        await editRetroAdminId({
          retrospectiveId: retrospectiveData.id,
          newAdminId
        });

        displayNewAdminToast(channel, newAdminId);
      })
      .on('broadcast', { event: REALTIME_EVENT_KEYS.REVALIDATE }, revalidate)
      .on('broadcast', { event: REALTIME_EVENT_KEYS.END_RETRO }, ({ payload }) => {
        if (currentUser.id !== adminId) {
          setDisplayedContent(payload.finalSummary);
          revalidate();
        }
      })
      .on('broadcast', { event: REALTIME_EVENT_KEYS.DISCONNECT_USER }, async ({ payload }) => {
        const { userId } = payload;
        const activeUsers = getPresenceActiveUsers(channel);
        const user = activeUsers.find((user) => user.id === userId);

        if (userId === currentUser.id) {
          setCurrentUser({ ...currentUser, hasBeenDisconnected: true });
          channel.untrack(user);
          return;
        }

        const filteredUsers = activeUsers.filter((user) => user.id !== userId);
        updateOnlineUsers(filteredUsers);
        toast({ title: `${user?.name} has been kicked from the session`, variant: 'destructive' });
      })
      .on('broadcast', { event: REALTIME_EVENT_KEYS.TIMER }, async ({ payload }) => {
        setTimerState(payload.timerState);
      })
      .on('broadcast', { event: REALTIME_EVENT_KEYS.RESET_TIMER }, async ({ payload }) => {
        setTimerState('off');
        setTimeLeft(payload.defaultTime);
      })
      .on('broadcast', { event: REALTIME_EVENT_KEYS.DISTRIBUTE_KEY }, async ({ payload }) => {
        if (!symmetricKey) {
          setSymmetricKey(payload.symmetricKey);
        }
      });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Track current user presence to the channel
        await channel.track(currentUser);
        setChannel(channel);
      }
    });

    return () => {
      supabase.removeChannel(channel).catch((err) => console.error('Cleanup error:', err));
      setChannel(null);
    };
  }, []);
};
