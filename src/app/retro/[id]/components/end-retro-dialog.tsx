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
import { useUserSession } from "@/hooks/user-session-context";

export function EndRetroDialog({ adminId }: { adminId: string }) {
  const { userSession } = useUserSession();

  const isAdmin = adminId === userSession?.id;

  if (!isAdmin) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="absolute bottom-20 right-20">
          END RETRO
        </Button>
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
          <AlertDialogAction
            asChild
            onClick={() => console.log("ending retro")}
          >
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
