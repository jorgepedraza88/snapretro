"use client";

import React, { useCallback, useContext, useEffect, useMemo } from "react";
import { ImSpinner as SpinnerIcon } from "react-icons/im";
import { usePresenceStore } from "@/stores/usePresenceStore";
import { useAdminStore } from "@/stores/useAdminStore";
import { useRetroSummaryStore } from "@/stores/useRetroSummaryStore";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { useUserSession } from "@/components/UserSessionContext";
import { endRetrospective, generateAIContent } from "@/app/actions";
import { generateMarkdownFromJSON } from "@/app/utils";
import { useToast } from "@/hooks/useToast";
import { RetrospectiveData } from "@/types/Retro";
import { useShallow } from "zustand/shallow";

interface RetroContextProviderProps {
  data: RetrospectiveData;
  children: React.ReactNode;
}

interface RetroContextValue {
  retrospectiveId: string;
  defaultSeconds: number;
  hasRetroEnded: boolean;
  handleEndRetro: () => void;
}

export const RetroContext = React.createContext<RetroContextValue | null>(null);

export function RetroContextProvider({
  data,
  children,
}: RetroContextProviderProps) {
  const { userSession } = useUserSession();
  const { toast } = useToast();

  const adminSettings = useAdminStore((state) => state.settings);
  const { onlineUsers, currentUser, setCurrentUser } = usePresenceStore(
    useShallow((state) => ({
      onlineUsers: state.onlineUsers,
      currentUser: state.getCurrentUser(),
      setCurrentUser: state.setCurrentUser,
    })),
  );
  const { isLoadingFinalContent, startTypingEffect, setLoading } =
    useRetroSummaryStore(
      useShallow((state) => ({
        isLoadingFinalContent: state.isLoadingFinalContent,
        startTypingEffect: state.startTypingEffect,
        setLoading: state.setLoading,
      })),
    );

  // Initialize realtime
  useRealtimeSubscription(data.id, userSession?.id);

  // Initialize current user
  useEffect(() => {
    if (userSession) {
      setCurrentUser({
        id: userSession.id,
        name: userSession.name,
        isAdmin: data.adminId === userSession.id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSession, data.adminId]);

  const generateFinalContent = useCallback(
    async (endResponse: RetrospectiveData) => {
      if (!adminSettings.useSummaryAI) {
        return generateMarkdownFromJSON(
          endResponse,
          onlineUsers.map((user) => user.name),
        );
      }

      const aiContent = await generateAIContent(
        endResponse,
        onlineUsers.map((user) => user.name),
      );

      return (
        aiContent ||
        generateMarkdownFromJSON(
          endResponse,
          onlineUsers.map((user) => user.name),
        )
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onlineUsers, adminSettings.useSummaryAI],
  );

  const handleEndRetro = useCallback(async () => {
    setLoading(true);

    try {
      const endResponse = await endRetrospective(data.id);
      if (!endResponse) {
        throw new Error("Failed to end retrospective");
      }

      const finalContent = await generateFinalContent(endResponse);

      startTypingEffect(finalContent);
    } catch (error) {
      toast({ title: "Error ending retro", variant: "destructive" });
      console.log("Error ending retro:", error);
    } finally {
      setLoading(false);
    }
  }, [data.id, generateFinalContent, setLoading, startTypingEffect, toast]);

  const contextValue = useMemo(
    () => ({
      retrospectiveId: data.id,
      defaultSeconds: data.timer,
      hasRetroEnded: data.status === "ended",
      handleEndRetro,
    }),
    [data.id, data.status, data.timer, handleEndRetro],
  );

  if (isLoadingFinalContent) {
    return (
      <div className="flex flex-col justify-center items-center gap-2 h-full">
        <p>Loading final summary...</p>
        <SpinnerIcon size={50} className="animate-spin text-violet-700" />
      </div>
    );
  }

  // If the user has not been initialized properly (e.g. guest user) then do not render the page
  if (currentUser.id === "guest") {
    return null;
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
