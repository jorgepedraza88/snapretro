import { create } from 'zustand';

type SummaryState = {
  finalSummary: string;
  displayedContent: string;
  isLoadingFinalContent: boolean;
  isTyping: boolean;
  setFinalSummary: (content: string) => void;
  setDisplayedContent: (content: string) => void;
  setIsLoadingFinalContent: (loading: boolean) => void;
  startTypingEffect: (content: string) => void;
};

export const useRetroSummaryStore = create<SummaryState>((set) => ({
  finalSummary: '',
  displayedContent: '',
  isLoadingFinalContent: false,
  isTyping: false,

  setFinalSummary: (content) => set({ finalSummary: content }),
  setDisplayedContent: (content) => set({ displayedContent: content }),
  setIsLoadingFinalContent: (loading) => set({ isLoadingFinalContent: loading }),

  startTypingEffect: (content) => {
    set({ isTyping: true, displayedContent: '' });
    let index = 0;
    const interval = setInterval(() => {
      set((state) => {
        if (index >= content.length) {
          clearInterval(interval);
          return { isTyping: false };
        }
        return {
          displayedContent: state.displayedContent + content.charAt(index++)
        };
      });
    }, 5);
  }
}));
