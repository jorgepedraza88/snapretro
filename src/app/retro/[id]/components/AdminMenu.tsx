'use client';

import { useEffect } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import {
  HiAdjustmentsHorizontal as AdminSettingsIcon,
  HiBars4 as ColumnIcons,
  HiLockClosed as PasswordIcon,
  HiOutlineClock as TimerIcon
} from 'react-icons/hi2';
import { useShallow } from 'zustand/shallow';

import { RetrospectiveData } from '@/types/Retro';
import { useRealtimeActions } from '@/hooks/useRealtimeActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { editRetroPassword, editRetroSectionsNumber, editRetroSettings } from '@/app/actions';
import { formatTimer } from '@/app/utils';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/stores/useAdminStore';
import { usePresenceStore } from '@/stores/usePresenceStore';
import { EndRetroDialog } from './EndRetroDialog';
import { useRetroContext } from './RetroContextProvider';

interface AdminMenuData {
  timer: number;
  columns: number;
  password: string;
  allowMessages: boolean;
  allowVotes: boolean;
}

export function AdminMenu({ retrospectiveData }: { retrospectiveData: RetrospectiveData }) {
  const { hasRetroEnded } = useRetroContext();
  const { currentUser, adminId } = usePresenceStore(
    useShallow((state) => ({
      adminId: state.adminId,
      currentUser: state.currentUser
    }))
  );
  const { setTimeLeft, timeLeft } = useAdminStore(
    useShallow((state) => ({
      timeLeft: state.timeLeft,
      setTimeLeft: state.setTimeLeft
    }))
  );

  const { revalidatePageBroadcast } = useRealtimeActions();

  const currentPassword = retrospectiveData.password || '';
  const isCurrentUserAdmin = adminId === currentUser.id;

  const form = useForm<AdminMenuData>({
    defaultValues: {
      columns: retrospectiveData.sections.length,
      password: currentPassword || '',
      allowMessages: retrospectiveData.allowMessages,
      allowVotes: retrospectiveData.allowVotes
    }
  });

  const onSubmit = async (data: AdminMenuData) => {
    if (form.formState.isSubmitting) return;

    const { columns, password: newPassword, ...restData } = data;

    if (columns !== retrospectiveData.sections.length) {
      await editRetroSectionsNumber(retrospectiveData.id, data.columns);
    }

    if (newPassword !== currentPassword) {
      await editRetroPassword(retrospectiveData.id, newPassword);
    }

    if (
      retrospectiveData.allowMessages !== restData.allowMessages ||
      retrospectiveData.allowVotes !== restData.allowVotes
    ) {
      await editRetroSettings(retrospectiveData.id, restData);
    }

    revalidatePageBroadcast(retrospectiveData.id);
  };

  const formValues = useWatch({
    control: form.control
  }) as AdminMenuData;

  // TODO: Optimize settings change - make independent calls, maybe not use react hook forms
  useEffect(() => {
    onSubmit(formValues);
  }, [formValues]);

  if (!isCurrentUserAdmin || hasRetroEnded) {
    return null;
  }

  return (
    <div className="fixed bottom-8 rounded-lg border bg-neutral-50 px-3 py-2 shadow-md dark:bg-neutral-900">
      <div className="w-fit text-sm">
        <FormProvider {...form}>
          <form className="flex items-center gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex flex-col items-center">
                  <Button variant="ghost" size="icon">
                    <TimerIcon size={20} />
                  </Button>
                  <Label className="text-xs">Timer</Label>
                </div>
              </PopoverTrigger>
              <PopoverContent
                sideOffset={4}
                side="top"
                align="center"
                className="w-60 bg-neutral-100 dark:bg-neutral-900"
              >
                <div>
                  <div className="">
                    <Label>Select time:</Label>
                    <p className="w-full text-center text-sm dark:text-neutral-100">
                      {formatTimer(timeLeft)} minutes
                    </p>
                    <Slider
                      defaultValue={[300]}
                      max={600}
                      min={60}
                      step={60}
                      value={[timeLeft]}
                      className="mt-1"
                      onValueChange={(val) => setTimeLeft(val[0])}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Controller
              name="columns"
              control={form.control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="flex flex-col items-center">
                      <Button variant="ghost" size="icon">
                        <ColumnIcons size={20} />
                      </Button>
                      <Label className="text-xs">Columns</Label>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    sideOffset={4}
                    side="top"
                    align="center"
                    className="w-fit bg-neutral-100 dark:bg-neutral-900"
                  >
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className={cn('rounded-r-none border', {
                          'bg-violet-500 text-white': field.value === 2
                        })}
                        onClick={() => field.onChange(2)}
                      >
                        2
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className={cn('rounded-none border', {
                          'bg-violet-500 text-white': field.value === 3
                        })}
                        onClick={() => field.onChange(3)}
                      >
                        3
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className={cn('rounded-l-none border', {
                          'bg-violet-500 text-white': field.value === 4
                        })}
                        onClick={() => field.onChange(4)}
                      >
                        4
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            />

            <Popover>
              <PopoverTrigger asChild>
                <div className="flex flex-col items-center">
                  <Button variant="ghost" size="icon">
                    <PasswordIcon size={16} />
                  </Button>
                  <Label className="text-xs">Secret</Label>
                </div>
              </PopoverTrigger>
              <PopoverContent
                sideOffset={4}
                side="top"
                align="center"
                className="w-fit bg-neutral-100 dark:bg-neutral-900"
              >
                <Input placeholder="Add a secret word" {...form.register('password')} />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <div className="flex flex-col items-center">
                  <Button variant="ghost" size="icon">
                    <AdminSettingsIcon size={16} />
                  </Button>
                  <Label className="text-xs">Settings</Label>
                </div>
              </PopoverTrigger>
              <PopoverContent
                sideOffset={4}
                side="top"
                align="center"
                className="w-fit bg-neutral-100 dark:bg-neutral-900"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Controller
                      name="allowMessages"
                      control={form.control}
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                    <Label className="text-xs">Messages</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Controller
                      name="allowVotes"
                      control={form.control}
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                    <Label className="text-xs">Voting</Label>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <EndRetroDialog />
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
