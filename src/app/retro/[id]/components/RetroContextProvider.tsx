'use client';

import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { ImSpinner as SpinnerIcon } from 'react-icons/im';
import { useShallow } from 'zustand/shallow';

import { RetrospectiveData } from '@/types/Retro';
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
  const onlineUsers = usePresenceStore((state) => state.onlineUsers);
  const symmetricKey = usePresenceStore((state) => state.symmetricKey);
  const { isLoadingFinalContent, startTypingEffect, setIsLoadingFinalContent } =
    useRetroSummaryStore(
      useShallow((state) => ({
        isLoadingFinalContent: state.isLoadingFinalContent,
        startTypingEffect: state.startTypingEffect,
        setIsLoadingFinalContent: state.setIsLoadingFinalContent
      }))
    );

  // Initialize realtime
  useRealtimeSubscription(data.id);

  const generateFinalContent = useCallback(
    async (endResponse: RetrospectiveData) => {
      if (!symmetricKey) {
        return;
      }

      if (!useSummaryAI) {
        return generateMarkdownFromJSON(
          endResponse,
          onlineUsers.map((user) => user.name),
          symmetricKey
        );
      }

      // const aiContent = await generateAIContent(
      //   endResponse,
      //   onlineUsers.map((user) => user.name)
      // );

      const aiContent = undefined;

      return (
        aiContent ||
        generateMarkdownFromJSON(
          endResponse,
          onlineUsers.map((user) => user.name),
          symmetricKey
        )
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onlineUsers, useSummaryAI]
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
    } catch (error) {
      toast({ title: 'Error ending retro', variant: 'destructive' });
      console.log('Error ending retro:', error);
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

  if (isLoadingFinalContent) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p>Loading final summary...</p>
        <SpinnerIcon size={50} className="animate-spin text-violet-700" />
      </div>
    );
  }

  return <RetroContext.Provider value={contextValue}>{children}</RetroContext.Provider>;
}

export function useRetroContext() {
  const context = useContext(RetroContext);

  if (!context) {
    throw new Error('useRetroContext needs to be used within a RetroContextProvider');
  }
  return context;
}
