'use client';

import { useState } from 'react';

import { type RetrospectiveData } from '@/types/Retro';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserSession } from '@/components/UserSessionWrapper';

interface RetroProtectedWrapperProps {
  data: RetrospectiveData;
  children: React.ReactNode;
}

export function RetroProtectedWrapper({ data, children }: RetroProtectedWrapperProps) {
  const { userSession } = useUserSession();
  const { adminId, enablePassword, password } = data;

  const [inputPassword, setInputPassword] = useState('');
  const [accessGranted, setAccessGranted] = useState(adminId === userSession?.id);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (inputPassword === password) {
      setAccessGranted(true);
    }
  }

  if (!enablePassword) return children;

  if (enablePassword && accessGranted) return children;

  return (
    <AlertDialog open>
      <AlertDialogContent className="transition-none">
        <AlertDialogHeader>
          <AlertDialogTitle>Protected Access</AlertDialogTitle>
          <AlertDialogDescription>
            You need to enter the secret word to access this retrospective
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit}>
          <Label>
            Secret word
            <Input
              name="password"
              type="password"
              onChange={(e) => setInputPassword(e.target.value)}
              tabIndex={0}
              autoFocus
            />
          </Label>
          <div className="flex justify-end">
            <AlertDialogAction type="submit" className="mt-2">
              Submit
            </AlertDialogAction>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
