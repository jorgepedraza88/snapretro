'use client';

import { Controller, useForm } from 'react-hook-form';
import { HiArrowRight as ArrowRightIcon } from 'react-icons/hi2';
import { ImSpinner as SpinnerIcon } from 'react-icons/im';
import { ErrorMessage } from '@hookform/error-message';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { useRouter } from 'next/navigation';

import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { generateSymmetricKey } from '@/app/cryptoClient';
import { formatTimer } from '@/app/utils';
import { ROUTES } from '@/constants/routes';
import { usePresenceStore } from '@/stores/usePresenceStore';

interface CreateRetroFormData {
  name: string;
  userName: string;
  timer: number | null;
  enableChat: boolean;
  enablePassword: boolean;
  secretWord: string | null;
  sectionsNumber: number;
}

const defaultFormValues: CreateRetroFormData = {
  name: '',
  userName: '',
  timer: 300,
  enableChat: true,
  enablePassword: false,
  secretWord: null,
  sectionsNumber: 3
};

export function CreateRetroForm() {
  const router = useRouter();
  const { toast } = useToast();
  const setCurrentUser = usePresenceStore((state) => state.setCurrentUser);
  const setAdminId = usePresenceStore((state) => state.setAdminId);
  const setSymmetricKey = usePresenceStore((state) => state.setSymmetricKey);

  const form = useForm<CreateRetroFormData>({
    defaultValues: defaultFormValues,
    mode: 'onSubmit'
  });

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isSubmitting }
  } = form;

  const enablePassword = watch('enablePassword');
  const timer = watch('timer');

  const onSubmit = async (data: CreateRetroFormData) => {
    try {
      const adminId = `user_${nanoid(10)}`;

      const payload = {
        name: data.name,
        adminId,
        timer: data.timer,
        allowVotes: false,
        enableChat: data.enableChat,
        enablePassword: data.enablePassword,
        password: data.secretWord,
        sectionsNumber: data.sectionsNumber
      };

      const response = await axios.post('/api/retro', payload);
      const retrospective = response.data;

      setAdminId(adminId);

      const newSymmetricKey = generateSymmetricKey();
      setSymmetricKey(newSymmetricKey);

      setCurrentUser({
        id: adminId,
        name: data.userName,
        avatarUrl: ''
      });

      router.push(`${ROUTES.RETRO}/${retrospective.id}`);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error creating retrospective',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="mt-16 space-y-8">
        {/* Name and User Name Section */}
        <div className="space-y-4">
          <div className="space-y-1 text-sm">
            <Label htmlFor="name" className="dark:text-neutral-100">
              Retrospective Name
            </Label>
            <Input
              id="name"
              placeholder="e.g. Sprint 24 Retro"
              {...register('name', { required: 'Retrospective name is required' })}
            />
            <div className="text-xs text-red-500">
              <ErrorMessage name="name" errors={errors} />
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <Label htmlFor="userName" className="dark:text-neutral-100">
              Your Name
            </Label>
            <Input
              id="userName"
              placeholder="Enter your name"
              {...register('userName', { required: 'Your name is required' })}
            />
            <div className="text-xs text-red-500">
              <ErrorMessage name="userName" errors={errors} />
            </div>
          </div>
        </div>

        {/* Configuration Section */}
        <div className="mb-8">
          <h3 className="mb-4 font-medium dark:text-neutral-100">
            Configure your retrospective meeting:
          </h3>
          <div className="w-full space-y-4">
            <div className="flex items-center gap-2">
              <Controller
                control={control}
                name="enableChat"
                render={({ field }) => (
                  <Switch id="enable-chat" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              <Label htmlFor="enable-chat">Enable chat</Label>
            </div>

            <div className="flex items-center gap-2">
              <Controller
                control={control}
                name="timer"
                render={({ field }) => (
                  <div className="w-full">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="enable-timer"
                        checked={!!field.value}
                        onCheckedChange={() => {
                          if (field.value) {
                            field.onChange(null);
                          } else {
                            field.onChange(300);
                          }
                        }}
                      />
                      <Label htmlFor="enable-timer">Enable timer</Label>
                    </div>
                  </div>
                )}
              />
            </div>

            <div className="flex items-center gap-2">
              <Controller
                control={control}
                name="enablePassword"
                render={({ field }) => (
                  <Switch
                    id="enable-password"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="enable-password">Protect with a secret word</Label>
            </div>

            {enablePassword && (
              <div className="ml-12 pt-2">
                <Label htmlFor="secretWord">Choose your secret word</Label>
                <Input
                  id="secretWord"
                  {...register('secretWord', {
                    required: 'Secret word is required when protection is enabled',
                    minLength: {
                      value: 3,
                      message: 'Secret word must be at least 3 characters'
                    }
                  })}
                  className="mt-1"
                />
                <div className="mt-1 text-xs text-red-500">
                  <ErrorMessage name="secretWord" errors={errors} />
                </div>
              </div>
            )}
          </div>

          {!!timer && (
            <div className="my-4 ml-12">
              <Label>Select time:</Label>
              <p className="w-full text-center text-sm dark:text-neutral-100">
                {formatTimer(timer)} minutes
              </p>
              <Slider
                defaultValue={[300]}
                max={600}
                min={60}
                step={60}
                value={[timer]}
                className="mt-1"
                onValueChange={(val) => setValue('timer', val[0])}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex w-full justify-end gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <SpinnerIcon className="animate-spin" />
          ) : (
            <>
              Let&apos;s begin
              <ArrowRightIcon size={24} />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
