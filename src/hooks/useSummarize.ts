import { useEffect } from 'react';
import { useCompletion } from '@ai-sdk/react';
import { useShallow } from 'zustand/shallow';

import { RetrospectiveData } from '@/types/Retro';
import { useRealtimeActions } from '@/hooks/useRealtimeActions';
import { usePresenceStore } from '@/stores/usePresenceStore';
import { useRetroSummaryStore } from '@/stores/useRetroSummaryStore';

export const useSummarize = (data: RetrospectiveData) => {
  const symmetricKey = usePresenceStore((state) => state.symmetricKey);
  const participantHistory = usePresenceStore((state) => state.participantHistory);
  const { endRetroBroadcast } = useRealtimeActions();

  const { setIsLoadingFinalContent, setDisplayedContent } = useRetroSummaryStore(
    useShallow((state) => ({
      setIsLoadingFinalContent: state.setIsLoadingFinalContent,
      setDisplayedContent: state.setDisplayedContent
    }))
  );

  const { complete, isLoading, completion } = useCompletion({
    api: '/api/summarize',
    onFinish: (_prompt, completion) => {
      setIsLoadingFinalContent(false);
      if (completion) {
        endRetroBroadcast(data.id, completion);
      }
    },
    onError: (error) => {
      console.error('Error generating summary:', error);
      setIsLoadingFinalContent(false);
    }
  });

  useEffect(() => {
    if (completion) {
      setDisplayedContent(completion);
    }
  }, [completion, setDisplayedContent]);

  const generateSummary = async () => {
    if (!symmetricKey) return;

    setIsLoadingFinalContent(true);
    setDisplayedContent('');

    await complete('generate', {
      body: {
        data,
        participants: participantHistory.map((user) => user.name)
      },
      headers: {
        'X-Encrypted-Key': symmetricKey
      }
    });
  };

  return {
    generateSummary,
    isLoading
  };
};
