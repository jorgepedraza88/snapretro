'use client';

import { useForm } from 'react-hook-form';
import { nanoid } from 'nanoid';

import { type RetrospectiveData } from '@/types/Retro';
import { usePresenceStore } from '@/stores/usePresenceStore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle
} from './ui/alert-dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

type UserFormData = {
  userName: string;
  password: string;
};

export function NewUserDialog({ data }: Readonly<{ data: RetrospectiveData }>) {
  const setCurrentUser = usePresenceStore((state) => state.setCurrentUser);
  const shouldDisplayPassword = data.enablePassword;

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<UserFormData>({
    defaultValues: {
      userName: '',
      password: ''
    }
  });

  function handleSubmitNewUser(formData: UserFormData) {
    const { userName, password } = formData;
    if (shouldDisplayPassword && password !== data.password) {
      return;
    }

    const newUser = {
      id: `user_${nanoid()}`,
      name: userName,
      avatarUrl: '',
      isAdmin: false
    };

    setCurrentUser(newUser);
  }

  console.log(errors);

  return (
    <AlertDialog open>
      <AlertDialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Welcome!</AlertDialogTitle>
          <AlertDialogDescription>Introduce a user name to join the session</AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit(handleSubmitNewUser)}>
          <Label>
            Name
            <Input
              tabIndex={0}
              autoFocus
              {...register('userName', {
                required: true,
                minLength: 3
              })}
            />
          </Label>
          {shouldDisplayPassword && (
            <Label>
              Secret word
              <Input
                {...register('password', {
                  required: shouldDisplayPassword
                })}
              />
            </Label>
          )}
          <div className="mt-4 flex justify-end">
            <AlertDialogAction type="submit">Join session</AlertDialogAction>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
