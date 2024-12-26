"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { socket } from "@/socket";
import { nanoid } from "nanoid";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams, usePathname } from "next/navigation";

interface UserSession {
  id: string;
  name: string;
  avatarUrl: string;
}

interface UserSessionContextType {
  userSession: UserSession | null;
  setUserSession: (user: UserSession | null) => void;
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(
  undefined,
);

interface UserSessionContextProviderProps {
  children: ReactNode;
}

export function UserSessionContextProvider({
  children,
}: UserSessionContextProviderProps) {
  const pathname = usePathname();
  const shouldLoadUserDialog = pathname.includes("/retro/");

  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    return () => {
      socket.off();
      socket.disconnect();
    };
  }, []);

  function handleSubmitNewUser() {
    const newUser = {
      id: nanoid(5),
      name: userName,
      avatarUrl: "",
    };
    setUserSession(newUser);
  }

  return (
    <UserSessionContext.Provider value={{ userSession, setUserSession }}>
      {!userSession && shouldLoadUserDialog && (
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Welcome!</DialogTitle>
              <DialogDescription>
                Select your name to join the session
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitNewUser();
              }}
            >
              <Label>
                Name
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </Label>
              <div className="flex justify-end mt-4">
                <Button type="submit">Join session</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
      {(userSession || (!userSession && !shouldLoadUserDialog)) && children}
    </UserSessionContext.Provider>
  );
}

export function useUserSession() {
  const context = useContext(UserSessionContext);
  if (!context) {
    throw new Error(
      "useUserSession needs to be used within a UserSessionContextProvider",
    );
  }
  return context;
}
