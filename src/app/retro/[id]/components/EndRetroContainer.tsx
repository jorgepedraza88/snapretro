'use client';

import { HiDocumentDuplicate as DuplicateIcon } from 'react-icons/hi2';
import ReactMarkdown from 'react-markdown';

import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { useRetroSummaryStore } from '@/stores/useRetroSummaryStore';
import { useRetroContext } from './RetroContextProvider';

export function EndRetroContainer() {
  const { toast } = useToast();
  const { hasRetroEnded } = useRetroContext();
  const displayedContent = useRetroSummaryStore((state) => state.displayedContent);

  const handleCopyContentToClipboard = () => {
    try {
      navigator.clipboard.writeText(displayedContent);
      toast({
        title: 'Retrospective data copied to the clipboard'
      });
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error copying to the clipboard'
      });
    }
  };

  if (!hasRetroEnded) {
    return null;
  }

  return (
    <div className="relative mt-6 w-full">
      <div className="w-full p-4">
        <h1 className="text-5xl font-bold">Congratulations!</h1>
        <h2 className="mt-1 text-xl font-medium text-neutral-500">
          This Retrospective meeting is finished
        </h2>
        <div className="group relative mb-4 rounded-lg border border-transparent p-4 hover:border-neutral-200 hover:bg-neutral-100 mt-4">
          <ReactMarkdown className="markdown">{displayedContent}</ReactMarkdown>
          <Button
            variant="outline"
            size="icon"
            className="invisible absolute right-4 top-4 text-neutral-500 group-hover:visible"
            onClick={handleCopyContentToClipboard}
          >
            <DuplicateIcon size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
