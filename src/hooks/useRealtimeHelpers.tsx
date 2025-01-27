import { useRetroContext } from "@/app/retro/[id]/components/RetroContextProvider";
import { supabase } from "@/supabaseClient";

export function useRealtimeHelpers(channelId: string) {
  const channel = supabase.channel(channelId);

  function sendBroadcast<T>(event: string, payload?: T) {
    channel.send({
      type: "broadcast",
      event,
      payload: payload ?? {},
    });
  }

  return {
    channel,
    sendBroadcast,
  };
}
