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

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePathname } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
        <AlertDialog open>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Welcome!</AlertDialogTitle>
              <AlertDialogDescription>
                Select your name to join the session
              </AlertDialogDescription>
            </AlertDialogHeader>
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
                <AlertDialogAction type="submit">
                  Join session
                </AlertDialogAction>
              </div>
            </form>
          </AlertDialogContent>
        </AlertDialog>
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
