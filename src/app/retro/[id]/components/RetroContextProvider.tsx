"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { ImSpinner as SpinnerIcon } from "react-icons/im";

import { RetrospectiveData } from "@/types/Retro";
import { UserSession, useUserSession } from "@/hooks/user-session-context";
import { socket } from "@/socket";
import { endRetrospective, generateAIContent, revalidate } from "@/app/actions";
import { AdminMenu } from "./AdminMenu";

interface AdminSettings {
  allowNewParticipants: boolean;
  allowMessages: boolean;
  allowVotes: boolean;
}

export interface RetroContextValue {
  retrospectiveId: string;
  finalRetroSummary: string;
  isCurrentUserAdmin: boolean;
  userSession: UserSession;
  hasRetroEnded: boolean;
  participants: Participant[];
  isLoadingFinalContent: boolean;
  adminSettings: AdminSettings;
  setAdminSettings: React.Dispatch<React.SetStateAction<AdminSettings>>;
  handleEndRetro: () => void;
}

const RetroContext = createContext<RetroContextValue | null>(null);

interface RetroContextProviderProps {
  retrospectiveData: RetrospectiveData;
  children: ReactNode;
}

interface Participant {
  id: string;
  username: string;
  isAdmin: boolean;
}

export function RetroContextProvider({
  retrospectiveData,
  children,
}: RetroContextProviderProps) {
  const { userSession } = useUserSession();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoadingFinalContent, setIsLoadingFinalContent] = useState(false);
  const [finalRetroSummary, setFinalRetroSummary] = useState("");
  const [adminSettings, setAdminSettings] = useState({
    allowNewParticipants: true,
    allowMessages: true,
    allowVotes: true,
  });

  const hasRetroEnded = retrospectiveData.status === "ended";
  const isCurrentUserAdmin = retrospectiveData.adminId === userSession?.id;

  const handleEndRetro = async () => {
    setIsLoadingFinalContent(true);
    const retrospective = await endRetrospective(retrospectiveData.id);
    const participantsNames = participants.map(
      (participant) => participant.username,
    );

    if (retrospective) {
      const generatedAIContent = await generateAIContent(
        retrospective,
        participantsNames,
      );

      if (!generatedAIContent) {
        setFinalRetroSummary("An Error has ocurred. No summary generated");
        setIsLoadingFinalContent(false);
        return;
      }

      setFinalRetroSummary(generatedAIContent);

      socket.emit("retro-ended", retrospective.id, generatedAIContent);
    }

    setIsLoadingFinalContent(false);
  };

  useEffect(() => {
    socket.emit("get-active-users", retrospectiveData.id);

    // Listen for updates to the active participants
    socket.on("active-users", (users) => {
      setParticipants(users); // Update the state with the new participants list
    });

    socket.on("revalidate", () => {
      revalidate();
    });

    socket.on("settings", (settings) => {
      setAdminSettings(settings);
    });

    socket.on("retro-ended", (content) => {
      socket.emit("retro-ended-user", retrospectiveData.id, content);
      revalidate();
    });

    socket.on("retro-ended-user", (content: string) => {
      setFinalRetroSummary(content);
    });

    return () => {
      socket.off("revalidate");
      socket.off("active-users");
      socket.off("retro-ended-user");
    };
  }, []);

  if (!userSession) {
    throw new Error("User session is required");
  }

  const contextValue = useMemo(
    () => ({
      retrospectiveId: retrospectiveData.id,
      finalRetroSummary,
      isCurrentUserAdmin,
      userSession,
      hasRetroEnded,
      participants,
      isLoadingFinalContent,
      adminSettings,
      setAdminSettings,
      handleEndRetro,
    }),
    [
      finalRetroSummary,
      isCurrentUserAdmin,
      hasRetroEnded,
      participants,
      isLoadingFinalContent,
      adminSettings,
    ],
  );

  if (isLoadingFinalContent) {
    return (
      <SpinnerIcon size={50} className="animate-spin text-violet-700 mt-12" />
    );
  }

  return (
    <RetroContext.Provider value={contextValue}>
      {children}
    </RetroContext.Provider>
  );
}

export function useRetroContext() {
  const context = useContext(RetroContext);

  if (!context) {
    throw new Error(
      "useRetroContext needs to be used within a RetroContextProvider",
    );
  }
  return context;
}
