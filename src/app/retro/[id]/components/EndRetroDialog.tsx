"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function EndRetroDialog({
  onEndRetro,
  isCurrentUserAdmin,
}: {
  isCurrentUserAdmin: boolean;
  onEndRetro: () => void;
}) {
  if (!isCurrentUserAdmin) return null;
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">END RETRO</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="transition-none">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">
            End this retrospective meeting
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            You will end this retro for all participants.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4">
          <p>
            Are you sure you want to <strong>end this retro?</strong>
          </p>
          <p className="text-xs text-red-500">This action is not reversible</p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="secondary">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild onClick={onEndRetro}>
            <Button
              variant="destructive"
              className="bg-red-500 hover:bg-red-600"
            >
              END
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
