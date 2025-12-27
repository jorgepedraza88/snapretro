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
    setError,
    formState: { errors }
  } = useForm<UserFormData>({
    defaultValues: {
      userName: '',
      password: ''
    }
  });

  function handleSubmitNewUser(formData: UserFormData) {
    const { userName, password } = formData;
    if (shouldDisplayPassword && !password) {
      setError('password', { message: 'The secret word is required' });
      return;
    }
    if (shouldDisplayPassword && password !== data.password) {
      setError('password', { message: 'The secret word is incorrect' });
      return;
    }

    const newUser = {
      id: `user_${nanoid()}`,
      name: userName,
      avatarUrl: ''
    };

    setCurrentUser(newUser);
  }

  // TODO: Display error message

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
            <div className="pt-2">
              <Label>
                Secret word
                <Input {...register('password')} />
                {errors.password && (
                  <span className="text-xs text-red-500">{errors.password.message}</span>
                )}
              </Label>
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <AlertDialogAction type="submit">Join session</AlertDialogAction>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
