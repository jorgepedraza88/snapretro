"use client";

import { useEffect } from "react";
import { supabase } from "@/supabaseClient";
import { usePresenceStore, UserPresence } from "@/stores/usePresenceStore";

import REALTIME_EVENT_KEYS from "@/constants/realtimeEventKeys";
import { editRetroAdminId, revalidate } from "@/app/actions";
import { useToast } from "./useToast";
import { useRetroSummaryStore } from "@/stores/useRetroSummaryStore";

export const useRealtimeSubscription = (retroId: string, userId?: string) => {
  const { updateOnlineUsers, handleAdminChange, currentUser } =
    usePresenceStore();

  const { setDisplayedContent } = useRetroSummaryStore();

  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel(`retrospective:${retroId}`, {
      config: { presence: { key: userId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const presenceState = channel.presenceState<UserPresence>();
        const activeUsers = Object.values(presenceState).flat();
        updateOnlineUsers(activeUsers);

        // Handle admin change logic
        const currentAdmin = activeUsers.find((user) => user.isAdmin);
        if (!currentAdmin && activeUsers.length > 0) {
          handleAdminChange(activeUsers[0].id, "", retroId);
        }
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        toast({ title: `${newPresences[0]?.name} joined` });
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        toast({ title: `${leftPresences[0]?.name} left` });
      })
      .on(
        "broadcast",
        { event: REALTIME_EVENT_KEYS.ASSIGN_NEW_ADMIN },
        async ({ payload }) => {
          await handleAdminChange(
            payload.newAdminId,
            payload.oldAdminId,
            retroId,
          );
          await editRetroAdminId({
            retrospectiveId: retroId,
            newAdminId: payload.newAdminId,
          });
        },
      )
      .on("broadcast", { event: REALTIME_EVENT_KEYS.REVALIDATE }, revalidate)
      .on(
        "broadcast",
        { event: REALTIME_EVENT_KEYS.END_RETRO },
        ({ payload }) => {
          setDisplayedContent(payload.finalSummary);
          revalidate();
        },
      );

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED" && currentUser) {
        // Track current user presence to the channel
        await channel.track(currentUser);
      }
    });

    return () => {
      supabase
        .removeChannel(channel)
        .catch((err) => console.error("Cleanup error:", err));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
