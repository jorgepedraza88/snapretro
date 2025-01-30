"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import { ImSpinner as SpinnerIcon } from "react-icons/im";

import { RetrospectiveData } from "@/types/Retro";
import { UserSession, useUserSession } from "@/components/UserSessionContext";
import {
  editRetroAdminId,
  endRetrospective,
  generateAIContent,
  revalidate,
} from "@/app/actions";
import { generateMarkdownFromJSON } from "@/app/utils";
import { useRealtimeActions } from "@/hooks/useRealtimeActions";
import { supabase } from "@/supabaseClient";
import { useToast } from "@/hooks/useToast";
import { RealtimePresenceState } from "@supabase/supabase-js";
import REALTIME_EVENT_KEYS from "@/constants/realtimeEventKeys";

interface AdminSettings {
  allowMessages: boolean;
  allowVotes: boolean;
  useSummaryAI: boolean;
}

export interface RetroContextValue {
  retrospectiveId: string;
  finalRetroSummary: string;
  isCurrentUserAdmin: boolean;
  userSession: UserSession;
  hasRetroEnded: boolean;
  onlineUsers: UserPresence[];
  isLoadingFinalContent: boolean;
  adminSettings: AdminSettings;
  displayedContent: string;
  timerState: TimerState;
  timeLeft: number;
  setTimerState: React.Dispatch<React.SetStateAction<TimerState>>;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  setAdminSettings: React.Dispatch<React.SetStateAction<AdminSettings>>;
  handleEndRetro: () => void;
}

const RetroContext = createContext<RetroContextValue | null>(null);

interface RetroContextProviderProps {
  data: RetrospectiveData;
  children: ReactNode;
}

export type UserPresence = {
  id: string;
  name: string;
  isAdmin: boolean;
};

export type PresenceState = {
  [key: string]: UserPresence;
};

type RealtimeUsers = RealtimePresenceState<UserPresence>;

type TimerState = "on" | "off" | "finished";

const TYPING_EFFECT_SPEED = 5;
const DEFAULT_SECONDS = 300;

export function RetroContextProvider({
  data,
  children,
}: RetroContextProviderProps) {
  const { userSession } = useUserSession();
  const { endRetroBroadcast, changeAdminBroadcast } = useRealtimeActions();
  const { toast } = useToast();

  if (!userSession) {
    throw new Error("User session is required");
  }
  const [adminSettings, setAdminSettings] = useState({
    allowMessages: true,
    allowVotes: true,
    useSummaryAI: true,
  });

  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);

  // End Retro State
  const [isLoadingFinalContent, setIsLoadingFinalContent] = useState(false);
  const [finalRetroSummary, setFinalRetroSummary] = useState("");
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const hasRetroEnded = data.status === "ended";

  // Timer state
  const defaultSeconds = data.timer ?? DEFAULT_SECONDS;
  const [timerState, setTimerState] = useState<TimerState>("off");
  const [timeLeft, setTimeLeft] = useState(defaultSeconds);

  const isCurrentUserAdmin = data.adminId === userSession?.id;

  // TODO mejorar esta mierda
  const handleEndRetro = useCallback(async () => {
    let finalSummaryContent = "";

    setIsLoadingFinalContent(true);

    const endResponse = await endRetrospective(data.id);

    const onlineUserNames = onlineUsers.map((user) => user.name);

    if (endResponse) {
      if (adminSettings.useSummaryAI) {
        finalSummaryContent =
          (await generateAIContent(endResponse, onlineUserNames)) ??
          "An Error has ocurred. No summary generated";
      } else {
        finalSummaryContent = generateMarkdownFromJSON(
          endResponse,
          onlineUserNames,
        );

        setDisplayedContent(finalSummaryContent);
        setIsLoadingFinalContent(false);
        endRetroBroadcast(data.id, finalSummaryContent);
        return;
      }

      endRetroBroadcast(data.id, finalSummaryContent);

      setFinalRetroSummary(finalSummaryContent);
      setDisplayedContent(""); // Reset displayed content
      setIsTyping(true);
      setIsLoadingFinalContent(false);
    }

    setIsLoadingFinalContent(false);
  }, [data.id, onlineUsers, adminSettings.useSummaryAI, endRetroBroadcast]);

  const updateOnlineUsers = (newUsers: UserPresence[]) => {
    setOnlineUsers((prevUsers) => {
      const prevIds = prevUsers
        .map((user) => user.id)
        .sort()
        .join(",");
      const newIds = newUsers
        .map((user) => user.id)
        .sort()
        .join(",");
      return prevIds !== newIds ? newUsers : prevUsers;
    });
  };

  useEffect(() => {
    const channel = supabase.channel(`retrospective:${data.id}`, {
      config: {
        presence: {
          key: userSession.id,
        },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const presenceUsers = channel.presenceState() as RealtimeUsers;
        const activeUsers = Object.values(presenceUsers).flat();

        const currentAdmin = activeUsers.find((user) => user.isAdmin);

        if (!currentAdmin && activeUsers.length > 0) {
          changeAdminBroadcast(data.id, activeUsers[0].id);
        }

        updateOnlineUsers(activeUsers);
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        const newParticipant = newPresences[0];

        toast({
          title: `${newParticipant.name} has joined the session`,
        });
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        const leftParticipant = leftPresences[0];

        toast({
          title: `${leftParticipant?.name} has left the session`,
        });
      })
      .on(
        "broadcast",
        { event: REALTIME_EVENT_KEYS.ASSIGN_NEW_ADMIN },
        async ({ payload }) => {
          const { newAdminId, oldAdminId } = payload;

          await editRetroAdminId({
            retrospectiveId: data.id,
            newAdminId,
          });

          if (oldAdminId === userSession.id) {
            await channel.track({
              id: userSession.id,
              name: userSession.name,
              isAdmin: false,
            });
          }

          if (newAdminId === userSession.id) {
            await channel.track({
              id: userSession.id,
              name: userSession.name,
              isAdmin: true,
            });
            toast({
              title: "You are now the host",
            });
          } else {
            const presenceUsers = channel.presenceState() as RealtimeUsers;
            const onlineUsers = Object.values(presenceUsers).flat();
            const newAdmin = onlineUsers.find((user) => user.id === newAdminId);

            if (newAdmin) {
              toast({
                title: `${newAdmin.name} is now the host`,
              });
            } else {
              console.warn("New admin not found in the presence state");
            }
          }
        },
      )
      // TODO: Mirar para cambiar
      .on("broadcast", { event: REALTIME_EVENT_KEYS.REVALIDATE }, async () => {
        await revalidate();
      })
      .on(
        "broadcast",
        { event: REALTIME_EVENT_KEYS.END_RETRO },
        ({ payload }) => {
          setDisplayedContent(payload.finalSummary);
          // TODO: Cambiar
          revalidate();
        },
      )
      .on(
        "broadcast",
        { event: REALTIME_EVENT_KEYS.SETTINGS },
        ({ payload }) => {
          setAdminSettings(payload);
        },
      )
      .on("broadcast", { event: REALTIME_EVENT_KEYS.TIMER }, ({ payload }) => {
        if (isCurrentUserAdmin) return;
        setTimerState(payload.timerState);
      })
      .on("broadcast", { event: REALTIME_EVENT_KEYS.RESET_TIMER }, () => {
        if (isCurrentUserAdmin) return;

        setTimerState("off");
        setTimeLeft(defaultSeconds);
      })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") {
          return;
        }

        await channel.track({
          id: userSession.id,
          name: userSession?.name,
          isAdmin: isCurrentUserAdmin,
        });
      });

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isTyping && finalRetroSummary) {
      let index = 0;

      const interval = setInterval(() => {
        if (index < finalRetroSummary.length) {
          setDisplayedContent((prev) => prev + finalRetroSummary.charAt(index));
          index++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, TYPING_EFFECT_SPEED);

      return () => clearInterval(interval);
    }
  }, [isTyping, finalRetroSummary]);

  const contextValue = useMemo(
    () => ({
      retrospectiveId: data.id,
      finalRetroSummary,
      isCurrentUserAdmin,
      userSession,
      hasRetroEnded,
      onlineUsers,
      isLoadingFinalContent,
      adminSettings,
      displayedContent,
      defaultSeconds,
      timerState,
      timeLeft,
      setTimerState,
      setAdminSettings,
      handleEndRetro,
      setTimeLeft,
    }),
    [
      data.id,
      timeLeft,
      timerState,
      defaultSeconds,
      finalRetroSummary,
      isCurrentUserAdmin,
      userSession,
      hasRetroEnded,
      onlineUsers,
      isLoadingFinalContent,
      adminSettings,
      displayedContent,
      handleEndRetro,
      setTimeLeft,
    ],
  );

  if (isLoadingFinalContent) {
    return (
      <div className="flex flex-col justify-center items-center gap-2 h-full">
        <p>Loading final summary...</p>
        <SpinnerIcon size={50} className="animate-spin text-violet-700" />
      </div>
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
