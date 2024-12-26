"use client";

import { useState } from "react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useUserSession } from "@/hooks/user-session-context";
import {
  AlertDialogHeader,
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface RetroProtectedWrapperProps {
  passwordEnabled: boolean;
  retroPassword: string | null;
  adminId: string;
  children: React.ReactNode;
}

export function RetroProtectedWrapper({
  passwordEnabled,
  retroPassword,
  adminId,
  children,
}: RetroProtectedWrapperProps) {
  const { userSession } = useUserSession();

  const [password, setPassword] = useState("");
  const [accessGranted, setAccessGranted] = useState(
    adminId === userSession?.id,
  );

  if (!passwordEnabled) return children;

  if (passwordEnabled && accessGranted) return children;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password === retroPassword) {
      setAccessGranted(true);
    }
  }

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
              onChange={(e) => setPassword(e.target.value)}
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
