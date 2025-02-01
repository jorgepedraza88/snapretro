'use client';

import { useCallback } from 'react';

import REALTIME_EVENT_KEYS from '@/constants/realtimeEventKeys';
import { supabase } from '@/supabaseClient';

export function useRealtimeActions() {
  const sendBroadcast = useCallback(<T>(retrospectiveId: string, event: string, payload: T) => {
    supabase.channel(`retrospective:${retrospectiveId}`).send({
      type: 'broadcast',
      event,
      payload
    });
  }, []);

  const writingAction = useCallback(
    (retroId: string, sectionId: string, userId: string, action: 'start' | 'stop') => {
      const event =
        action === 'start' ? REALTIME_EVENT_KEYS.WRITING : REALTIME_EVENT_KEYS.STOP_WRITING;
      sendBroadcast(retroId, event, { sectionId, userId });
    },
    [sendBroadcast]
  );

  const revalidatePageBroadcast = useCallback(
    (retroId: string) => {
      sendBroadcast(retroId, REALTIME_EVENT_KEYS.REVALIDATE, {});
    },
    [sendBroadcast]
  );

  const endRetroBroadcast = useCallback(
    (retroId: string, finalSummary: string) => {
      sendBroadcast(retroId, REALTIME_EVENT_KEYS.END_RETRO, { finalSummary });
    },
    [sendBroadcast]
  );

  const changeAdminBroadcast = useCallback(
    (retroId: string, newAdminId: string) => {
      sendBroadcast(retroId, REALTIME_EVENT_KEYS.ASSIGN_NEW_ADMIN, {
        newAdminId
      });
    },
    [sendBroadcast]
  );

  const removeUserBroadcast = useCallback(
    (retroId: string, userId: string) => {
      sendBroadcast(retroId, REALTIME_EVENT_KEYS.DISCONNECT_USER, { userId });
    },
    [sendBroadcast]
  );

  const handleTimerBroadcast = useCallback(
    (retroId: string, timerState: 'on' | 'off' | 'reset') => {
      if (timerState === 'reset') {
        sendBroadcast(retroId, REALTIME_EVENT_KEYS.RESET_TIMER, {});
      }
      sendBroadcast(retroId, REALTIME_EVENT_KEYS.TIMER, { timerState });
    },
    [sendBroadcast]
  );

  const editAdminSettingsBroadcast = useCallback(
    (retroId: string, allowMessages: boolean, allowVotes: boolean) => {
      sendBroadcast(retroId, REALTIME_EVENT_KEYS.SETTINGS, {
        allowMessages,
        allowVotes
      });
    },
    [sendBroadcast]
  );

  return {
    writingAction,
    revalidatePageBroadcast,
    endRetroBroadcast,
    changeAdminBroadcast,
    removeUserBroadcast,
    handleTimerBroadcast,
    editAdminSettingsBroadcast
  };
}
