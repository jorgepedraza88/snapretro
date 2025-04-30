'use client';

import { ImSpinner as SpinnerIcon } from 'react-icons/im';
import { useShallow } from 'zustand/shallow';

import { useRetroSummaryStore } from '@/stores/useRetroSummaryStore';

export function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const { isLoadingFinalContent } = useRetroSummaryStore(
    useShallow((state) => ({
      isLoadingFinalContent: state.isLoadingFinalContent
    }))
  );

  if (isLoadingFinalContent) {
    return (
      <div className="-mt-10 flex size-full flex-col items-center justify-center gap-2">
        <p className="dark:text-neutral-100">Loading final summary...</p>
        <SpinnerIcon size={50} className="animate-spin text-violet-700 dark:text-neutral-100" />
      </div>
    );
  }

  return <div className="gap-2 bg-neutral-50 dark:bg-neutral-800 lg:flex">{children}</div>;
}
