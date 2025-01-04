import { supabase } from "@/supabaseClient";
import { RealtimeChannel } from "@supabase/supabase-js";

// Define types for presence metadata
interface PresenceMetadata {
  userId: string;
  username: string;
}

// Define types for broadcast messages
interface BroadcastPayload {
  type: string;
  data: any;
}

export const setupChannel = (channelName: string) => {
  // Initialize the channel
  const channel: RealtimeChannel = supabase.channel(channelName, {
    config: { presence: { key: "unique-user-id" } }, // Replace with unique user logic
  });

  // Subscribe to the channel
  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      console.log(`Subscribed to channel: ${channelName}`);

      // Track current user in the presence list
      channel.track({
        userId: "123", // Replace with real user ID
        username: "John Doe", // Replace with actual username
      });
    }
  });

  // Handle presence sync events
  channel.on("presence", { event: "sync" }, () => {
    const presenceState = channel.presenceState<PresenceMetadata>();
    console.log("Presence state:", presenceState);
  });

  // Handle broadcast events
  channel.on<BroadcastPayload>("broadcast", { event: "update" }, (payload) => {
    console.log("Received broadcast:", payload);
  });

  return channel;
};
