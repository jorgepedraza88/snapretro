"use client";

import { HiDocumentDuplicate as DuplicateIcon } from "react-icons/hi2";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { useRetroContext } from "./RetroContextProvider";
import { EndRetroDialog } from "./EndRetroDialog";

export function EndRetroContainer() {
  const { toast } = useToast();
  const { hasRetroEnded, finalRetroSummary, displayedContent, handleEndRetro } =
    useRetroContext();

  const handleCopyContentToClipboard = () => {
    try {
      navigator.clipboard.writeText(finalRetroSummary);
      toast({
        title: "Retrospective data copied to the clipboard",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error copying to the clipboard",
      });
    }
  };

  return (
    <div className="mt-6 relative w-full">
      {!hasRetroEnded ? (
        <EndRetroDialog onEndRetro={handleEndRetro} />
      ) : (
        <div className="w-full p-4">
          <h1 className="text-5xl font-bold ">Congratulations!</h1>
          <h2 className="text-xl font-medium text-neutral-500 mt-1">
            This Retrospective meeting is finish
          </h2>
          <div className="hover:bg-neutral-100 p-4 group rounded-lg border border-transparent hover:border-neutral-200 relative mb-4">
            <ReactMarkdown className="markdown">
              {displayedContent}
            </ReactMarkdown>
            <Button
              variant="outline"
              size="icon"
              className="invisible group-hover:visible absolute top-4 right-4 text-neutral-500"
              onClick={handleCopyContentToClipboard}
            >
              <DuplicateIcon size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
