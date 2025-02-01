'use client';

import { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { HiCog8Tooth as AdminSettingsIcon } from 'react-icons/hi2';
import { PopoverClose } from '@radix-ui/react-popover';
import { useShallow } from 'zustand/shallow';

import { RetrospectiveData } from '@/types/Retro';
import { useRealtimeActions } from '@/hooks/useRealtimeActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { editRetroPassword, editRetroSectionsNumber } from '@/app/actions';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/stores/useAdminStore';
import { usePresenceStore } from '@/stores/usePresenceStore';
import { useRetroContext } from './RetroContextProvider';

interface AdminMenuData {
  columns: number;
  password: string;
  allowNewParticipants: boolean;
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
  const { allowMessages, allowVotes, setAdminSettings } = useAdminStore(
    useShallow((state) => ({
      allowMessages: state.settings.allowMessages,
      allowVotes: state.settings.allowVotes,
      setAdminSettings: state.setSettings
    }))
  );
  const { revalidatePageBroadcast, editAdminSettingsBroadcast } = useRealtimeActions();

  const currentPassword = retrospectiveData.password || '';
  const isCurrentUserAdmin = adminId === currentUser.id;

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AdminMenuData>({
    defaultValues: {
      columns: retrospectiveData.sections.length,
      password: currentPassword || '',
      allowMessages: allowMessages,
      allowVotes: allowVotes
    }
  });

  const onSubmit = async (data: AdminMenuData) => {
    const { columns, password: newPassword, ...restData } = data;
    setIsSubmitting(true);

    if (columns !== retrospectiveData.sections.length) {
      await editRetroSectionsNumber(retrospectiveData.id, data.columns);
    }

    if (newPassword !== currentPassword) {
      await editRetroPassword(retrospectiveData.id, newPassword);
    }

    setAdminSettings({ ...restData });

    editAdminSettingsBroadcast(retrospectiveData.id, data.allowMessages, data.allowVotes);

    revalidatePageBroadcast(retrospectiveData.id);

    setIsPopoverOpen(false);
    setIsSubmitting(false);
  };

  if (!isCurrentUserAdmin || hasRetroEnded) {
    return null;
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="absolute -right-8 top-20" size="icon">
          <AdminSettingsIcon size={16} />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-fit bg-neutral-50 text-sm">
        <FormProvider {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <Label>Number of columns:</Label>
            <Controller
              name="columns"
              control={form.control}
              render={({ field }) => (
                <div className="mt-2">
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
              )}
            />

            <div>
              <Label>Secret word:</Label>
              <Input {...form.register('password')} />
            </div>
            <div>
              <Label>During meeting:</Label>
              <div className="mt-2 flex items-center gap-2">
                <Controller
                  name="allowMessages"
                  control={form.control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Label>Allow messages</Label>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Controller
                  name="allowVotes"
                  control={form.control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Label>Allow votes</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <PopoverClose asChild>
                <Button variant="outline">Cancel</Button>
              </PopoverClose>
              <Button type="submit" disabled={isSubmitting}>
                Apply
              </Button>
            </div>
          </form>
        </FormProvider>
      </PopoverContent>
    </Popover>
  );
}
