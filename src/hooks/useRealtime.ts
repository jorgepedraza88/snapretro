// hooks/useRealtime.ts
import { usePresenceStore } from "../stores/usePresenceStore";
import { useBroadcastStore } from "../stores/useBroadcastStore";
import { useEffect } from "react";
import { supabase } from "../supabaseClient";

export const useRealtime = (channelName: string) => {
  const { myId, addUser, updateLastSeen, removeUser } = usePresenceStore();
  const { receiveMessage } = useBroadcastStore();

  useEffect(() => {
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: myId,
        },
      },
    });

    // Presence handling
    channel.on("presence", { event: "sync" }, () => {
      const presenceState = channel.presenceState();
      // Update Zustand store with current presence
    });

    channel.on("presence", { event: "join" }, ({ newPresences }) => {
      // Handle new joins
    });

    channel.on("presence", { event: "leave" }, ({ leftPresences }) => {
      // Handle leaves
    });

    // Broadcast handling
    channel.on("broadcast", { event: "*" }, ({ payload }) => {
      receiveMessage(payload);
    });

    // Subscribe and track presence
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          id: myId,
          name: "User Name", // Add actual user data
          lastSeen: new Date().toISOString(),
        });
      }
    });

    // Heartbeat for presence
    const heartbeat = setInterval(() => {
      updateLastSeen();
      channel.track({ lastSeen: new Date().toISOString() });
    }, 5000);

    return () => {
      channel.untrack();
      channel.unsubscribe();
      clearInterval(heartbeat);
      removeUser(myId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId, channelName]);

  // Throttle presence updates
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateLastSeen();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [updateLastSeen]);
};
