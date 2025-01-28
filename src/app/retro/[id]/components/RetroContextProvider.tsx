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
import { endRetrospective, generateAIContent, revalidate } from "@/app/actions";
import { generateMarkdownFromJSON } from "@/app/utils";
import { endRetroBroadcast } from "@/app/realtimeActions";
import { supabase } from "@/supabaseClient";
import { useToast } from "@/hooks/useToast";
import { RealtimePresenceState } from "@supabase/supabase-js";

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
  participants: Participant[];
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
  retrospectiveData: RetrospectiveData;
  children: ReactNode;
}

export interface Participant {
  id: string;
  username: string;
  isAdmin: boolean;
}

type RealtimeParticipants = RealtimePresenceState<Participant>;

type TimerState = "on" | "off" | "finished";

const TYPING_EFFECT_SPEED = 5;
const DEFAULT_SECONDS = 300;

export function RetroContextProvider({
  retrospectiveData,
  children,
}: RetroContextProviderProps) {
  const { userSession } = useUserSession();

  if (!userSession) {
    throw new Error("User session is required");
  }

  const { toast } = useToast();

  const [adminSettings, setAdminSettings] = useState({
    allowMessages: true,
    allowVotes: true,
    useSummaryAI: true,
  });

  const [participants, setParticipants] = useState<Participant[]>([]);

  // End Retro State
  const [isLoadingFinalContent, setIsLoadingFinalContent] = useState(false);
  const [finalRetroSummary, setFinalRetroSummary] = useState("");
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const hasRetroEnded = retrospectiveData.status === "ended";

  // Timer state
  const defaultSeconds = retrospectiveData.timer ?? DEFAULT_SECONDS;
  const [timerState, setTimerState] = useState<TimerState>("off");
  const [timeLeft, setTimeLeft] = useState(defaultSeconds);

  const isCurrentUserAdmin = retrospectiveData.adminId === userSession?.id;

  const handleEndRetro = useCallback(async () => {
    let finalSummaryContent = "";

    setIsLoadingFinalContent(true);

    const endResponse = await endRetrospective(retrospectiveData.id);

    const participantsNames = participants.map(
      (participant) => participant.username,
    );

    if (endResponse) {
      if (adminSettings.useSummaryAI) {
        finalSummaryContent =
          (await generateAIContent(endResponse, participantsNames)) ??
          "An Error has ocurred. No summary generated";
      } else {
        finalSummaryContent = generateMarkdownFromJSON(
          endResponse,
          participantsNames,
        );

        setDisplayedContent(finalSummaryContent);
        setIsLoadingFinalContent(false);
        return;
      }

      await endRetroBroadcast(retrospectiveData.id, finalSummaryContent);

      setFinalRetroSummary(finalSummaryContent);
      setDisplayedContent(""); // Reset displayed content
      setIsTyping(true);
      setIsLoadingFinalContent(false);
    }

    setIsLoadingFinalContent(false);
  }, [retrospectiveData.id, participants, adminSettings.useSummaryAI]);

  useEffect(() => {
    const channel = supabase.channel(`retrospective:${retrospectiveData.id}`, {
      config: {
        presence: {
          key: userSession.id,
        },
      },
    });

    channel
      .on("presence", { event: "join" }, ({ newPresences }) => {
        const newParticipant = newPresences[0];

        setParticipants((prevParticipants) => [
          ...prevParticipants,
          {
            id: newParticipant.userId,
            username: newParticipant.username,
            isAdmin: newParticipant.isAdmin,
          },
        ]);

        toast({
          title: `${newParticipant?.username} has joined the session`,
        });
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        const leftParticipant = leftPresences[0];

        setParticipants((prevParticipants) =>
          prevParticipants.filter(
            (participant) => participant.id !== leftParticipant?.id,
          ),
        );

        toast({
          title: `${leftParticipant?.username} has left the session`,
        });
      })
      .on("broadcast", { event: "assign-new-admin" }, async ({ payload }) => {
        const { newAdminId } = payload;

        if (newAdminId === userSession.id) {
          toast({
            title: "You are now the host",
          });
        } else {
          const users = channel.presenceState() as RealtimeParticipants;
          const newAdmin = users[newAdminId][0];

          toast({
            title: `${newAdmin?.username} is now the host`,
          });
        }
      })
      .on("broadcast", { event: "revalidate" }, async () => {
        await revalidate();
      })
      .on("broadcast", { event: "end-retro" }, ({ payload }) => {
        setFinalRetroSummary(payload.finalSummary);
      })
      .on("broadcast", { event: "settings" }, ({ payload }) => {
        setAdminSettings(payload);
      })
      .on("broadcast", { event: "timer" }, ({ payload }) => {
        if (isCurrentUserAdmin) return;
        setTimerState(payload.timerState);
      })
      .on("broadcast", { event: "reset-timer" }, () => {
        if (isCurrentUserAdmin) return;

        setTimerState("off");
        setTimeLeft(defaultSeconds);
      })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") {
          return;
        }

        await channel.track({
          userId: userSession.id,
          username: userSession?.name,
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
      retrospectiveId: retrospectiveData.id,
      finalRetroSummary,
      isCurrentUserAdmin,
      userSession,
      hasRetroEnded,
      participants,
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
      retrospectiveData.id,
      timeLeft,
      timerState,
      defaultSeconds,
      finalRetroSummary,
      isCurrentUserAdmin,
      userSession,
      hasRetroEnded,
      participants,
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
