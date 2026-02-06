'use client';

import React, { useCallback, useContext, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';

import { RetrospectiveData } from '@/types/Retro';
import { useEndRetroMutation } from '@/hooks/api/mutation/useRetroMutations';
import { useRealtimeActions } from '@/hooks/useRealtimeActions';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useSummarize } from '@/hooks/useSummarize';
import { useToast } from '@/hooks/useToast';
import { generateMarkdownFromJSON } from '@/app/utils';
import { useAdminStore } from '@/stores/useAdminStore';
import { usePresenceStore } from '@/stores/usePresenceStore';
import { useRetroSummaryStore } from '@/stores/useRetroSummaryStore';

interface RetroContextProviderProps {
  data: RetrospectiveData;
  children: React.ReactNode;
}

interface RetroContextValue {
  defaultSeconds: number;
  hasRetroEnded: boolean;
  handleEndRetro: () => void;
}

export const RetroContext = React.createContext<RetroContextValue | null>(null);

export function RetroContextProvider({ data, children }: RetroContextProviderProps) {
  const { toast } = useToast();

  const useSummaryAI = useAdminStore((state) => state.useSummaryAI);
  const participantHistory = usePresenceStore((state) => state.participantHistory);
  const symmetricKey = usePresenceStore((state) => state.symmetricKey);

  const { endRetroBroadcast } = useRealtimeActions();
  const endRetroMutation = useEndRetroMutation();

  const { setIsLoadingFinalContent, setDisplayedContent } = useRetroSummaryStore(
    useShallow((state) => ({
      setIsLoadingFinalContent: state.setIsLoadingFinalContent,
      setDisplayedContent: state.setDisplayedContent
    }))
  );

  // Initialize realtime
  useRealtimeSubscription(data);

  const { generateSummary } = useSummarize(data);

  const handleEndRetro = useCallback(async () => {
    setIsLoadingFinalContent(true);

    try {
      const endResponse = await endRetroMutation.mutateAsync({ retrospectiveId: data.id });
      if (!endResponse) {
        throw new Error('Failed to end retrospective');
      }

      if (useSummaryAI) {
        await generateSummary();
      } else {
        if (!symmetricKey) {
          throw new Error('Missing encryption key');
        }

        const nonAiContent = generateMarkdownFromJSON(
          data,
          participantHistory.map((user) => user.name),
          symmetricKey
        );

        setDisplayedContent(nonAiContent);
        endRetroBroadcast(data.id, nonAiContent);
        setIsLoadingFinalContent(false);
      }
    } catch (error) {
      toast({ title: 'Error ending retro', variant: 'destructive' });
      setIsLoadingFinalContent(false);
    }
  }, [
    data,
    endRetroMutation,
    generateSummary,
    setIsLoadingFinalContent,
    useSummaryAI,
    participantHistory,
    symmetricKey,
    toast,
    setDisplayedContent,
    endRetroBroadcast
  ]);

  const contextValue = useMemo(
    () => ({
      defaultSeconds: data.timer,
      hasRetroEnded: data.status === 'ended',
      handleEndRetro
    }),
    [data.id, data.status, data.timer, handleEndRetro]
  );

  return <RetroContext.Provider value={contextValue}>{children}</RetroContext.Provider>;
}

export function useRetroContext() {
  const context = useContext(RetroContext);

  if (!context) {
    throw new Error('useRetroContext needs to be used within a RetroContextProvider');
  }
  return context;
}
