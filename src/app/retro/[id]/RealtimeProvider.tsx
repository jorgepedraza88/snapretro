"use client";

import { supabase } from "@/supabaseClient";
import { useEffect } from "react";

export function RealtimeProvider({ retroId }: { retroId: string }) {
  useEffect(() => {
    const channel = supabase.channel(retroId);

    // Simple function to log any messages we receive
    function messageReceived(payload) {
      console.log(payload);
    }

    // Subscribe to the Channel
    channel
      .on("broadcast", { event: "test" }, (payload) => messageReceived(payload))
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [retroId]);

  function sendMessage() {
    const channel = supabase.channel(retroId);
    // Send a message once the client is subscribed
    channel.send({
      type: "broadcast",
      event: "test",
      payload: { message: "hola mundo" },
    });
  }

  return (
    <div>
      <button onClick={sendMessage}>Send Message</button>
      hola
    </div>
  );
}
