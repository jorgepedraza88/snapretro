"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useUserSession } from "@/hooks/user-session-context";

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
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Protected Access</DialogTitle>
          <DialogDescription>
            You need to enter the secret word to access this retrospective
          </DialogDescription>
        </DialogHeader>
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
            <Button type="submit" className="mt-2">
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
