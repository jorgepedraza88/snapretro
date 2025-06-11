'use client';

import React, { useCallback, useContext, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';

import { RetrospectiveData } from '@/types/Retro';
import { useRealtimeActions } from '@/hooks/useRealtimeActions';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useToast } from '@/hooks/useToast';
import { endRetrospective } from '@/app/actions';
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
  const { startTypingEffect, setIsLoadingFinalContent } = useRetroSummaryStore(
    useShallow((state) => ({
      isLoadingFinalContent: state.isLoadingFinalContent,
      startTypingEffect: state.startTypingEffect,
      setIsLoadingFinalContent: state.setIsLoadingFinalContent
    }))
  );

  // Initialize realtime
  useRealtimeSubscription(data);

  const generateFinalContent = useCallback(
    async (endResponse: RetrospectiveData) => {
      if (!symmetricKey) {
        return;
      }

      if (!useSummaryAI) {
        return generateMarkdownFromJSON(
          endResponse,
          participantHistory.map((user) => user.name),
          symmetricKey
        );
      }

      try {
        const response = await fetch('/api/summarize/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Encrypted-Key': symmetricKey
          },
          body: JSON.stringify({
            data: endResponse,
            participants: participantHistory.map((user) => user.name)
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const { summary: aiContent } = await response.json();

        return (
          aiContent ||
          generateMarkdownFromJSON(
            endResponse,
            participantHistory.map((user) => user.name),
            symmetricKey
          )
        );
      } catch (error) {
        console.error('Error generating AI summary:', error);
        // Fallback to non-AI summary
        return generateMarkdownFromJSON(
          endResponse,
          participantHistory.map((user) => user.name),
          symmetricKey
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [participantHistory, useSummaryAI]
  );

  const handleEndRetro = useCallback(async () => {
    setIsLoadingFinalContent(true);

    try {
      const endResponse = await endRetrospective(data.id);
      if (!endResponse) {
        throw new Error('Failed to end retrospective');
      }

      const finalContent = await generateFinalContent(endResponse);

      if (!finalContent) {
        throw new Error('Failed to generate final content');
      }

      startTypingEffect(finalContent);
      endRetroBroadcast(data.id, finalContent);
    } catch (error) {
      toast({ title: 'Error ending retro', variant: 'destructive' });
    } finally {
      setIsLoadingFinalContent(false);
    }
  }, [data.id, generateFinalContent, setIsLoadingFinalContent, startTypingEffect, toast]);

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
