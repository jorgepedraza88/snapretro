import { create } from 'zustand';

type SummaryState = {
  finalSummary: string;
  displayedContent: string;
  isLoadingFinalContent: boolean;
  setFinalSummary: (content: string) => void;
  setDisplayedContent: (content: string) => void;
  setIsLoadingFinalContent: (loading: boolean) => void;
};

export const useRetroSummaryStore = create<SummaryState>((set) => ({
  finalSummary: '',
  displayedContent: '',
  isLoadingFinalContent: false,

  setFinalSummary: (content) => set({ finalSummary: content }),
  setDisplayedContent: (content) => set({ displayedContent: content }),
  setIsLoadingFinalContent: (loading) => set({ isLoadingFinalContent: loading })
}));
