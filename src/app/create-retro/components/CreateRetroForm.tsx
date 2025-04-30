'use client';

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { HiArrowRight as ArrowRightIcon } from 'react-icons/hi2';
import { ImSpinner as SpinnerIcon } from 'react-icons/im';
import { nanoid } from 'nanoid';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { createRetro, CreateRetrospectiveData } from '@/app/actions';
import { generateSymmetricKey } from '@/app/cryptoClient';
import { ROUTES } from '@/constants/routes';
import { usePresenceStore } from '@/stores/usePresenceStore';
import { CreateRetroFirst } from './CreateRetroFirst';
import { CreateRetroSecond } from './CreateRetroSecond';

const defaultFormValues: CreateRetrospectiveData = {
  adminId: `user_${nanoid(10)}`,
  avatarUrl: '',
  adminName: '',
  timer: 300,
  allowVotes: false,
  enableChat: true,
  enablePassword: false,
  password: null,
  sectionsNumber: 3
};

export function CreateRetroForm() {
  const router = useRouter();
  const setCurrentUser = usePresenceStore((state) => state.setCurrentUser);
  const setAdminId = usePresenceStore((state) => state.setAdminId);
  const setSymmetricKey = usePresenceStore((state) => state.setSymmetricKey);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateRetrospectiveData>({
    defaultValues: defaultFormValues
  });

  const onSubmit = async (data: CreateRetrospectiveData) => {
    setIsSubmitting(true);
    try {
      const retrospective = await createRetro(data);

      setAdminId(data.adminId);

      const newSymmetricKey = generateSymmetricKey();

      setSymmetricKey(newSymmetricKey);

      setCurrentUser({
        id: data.adminId,
        name: data.adminName,
        avatarUrl: data.avatarUrl
      });

      router.push(`${ROUTES.RETRO}/${retrospective.id}`);
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="mt-16 space-y-4">
          {/* //TODO: Simplify in 1 component */}
          <CreateRetroFirst />
          <CreateRetroSecond />
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
    </FormProvider>
  );
}
