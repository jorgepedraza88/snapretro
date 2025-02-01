'use client';

import { BsStars as AiIcon } from 'react-icons/bs';
import { useShallow } from 'zustand/shallow';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAdminStore } from '@/stores/useAdminStore';
import { usePresenceStore } from '@/stores/usePresenceStore';
import { useRetroContext } from './RetroContextProvider';

export function EndRetroDialog() {
  const { handleEndRetro } = useRetroContext();
  const currentUser = usePresenceStore((state) => state.currentUser);
  const { adminSettings, setAdminSettings } = useAdminStore(
    useShallow((state) => ({
      adminSettings: state.settings,
      setAdminSettings: state.setSettings
    }))
  );

  if (!currentUser.isAdmin) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          End meeting
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
        <AlertDialogFooter className="w-full sm:justify-between">
          <Label className="flex items-center gap-1">
            <Switch
              checked={adminSettings.useSummaryAI}
              onCheckedChange={(val) =>
                setAdminSettings({
                  useSummaryAI: val
                })
              }
            />
            <span className="mr-2">Generate Summary with AI</span>
            <AiIcon size={16} className="text-violet-700" />
          </Label>
          <div className="flex gap-2">
            <AlertDialogCancel asChild>
              <Button variant="secondary">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild onClick={handleEndRetro}>
              <Button>End Retro</Button>
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
