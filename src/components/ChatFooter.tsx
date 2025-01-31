"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { supabase } from "@/supabaseClient";
import { useParams } from "next/navigation";
import { ChatSidebar } from "./ChatSidebar";
import REALTIME_EVENT_KEYS from "@/constants/realtimeEventKeys";
import { usePresenceStore } from "@/stores/usePresenceStore";

function ChatNotificationDot() {
  return (
    <>
      <span className="animate-ping absolute inline-flex size-[10px] rounded-full bg-red-400 opacity-75 -top-0.5 -left-0.5"></span>
      <span className="absolute inline-flex rounded-full size-[10px] bg-red-500 -top-0.5 -left-0.5"></span>
    </>
  );
}

export function ChatFooter() {
  const { id: retrospectiveId } = useParams<{ id: string }>();
  const currentUser = usePresenceStore((state) => state.currentUser);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatNotification, setChatNotification] = useState(false);

  const handleToogleSidebar = () => {
    // Remove the notification when opening the chat
    if (chatNotification) {
      setChatNotification(false);
    }

    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    const channel = supabase.channel(`notifications:${retrospectiveId}`);

    channel
      .on(
        "broadcast",
        { event: REALTIME_EVENT_KEYS.CHAT_NOTIFICATION },
        ({ payload }) => {
          if (payload.user !== currentUser.id) {
            setChatNotification(true);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [retrospectiveId, currentUser.id]);

  return (
    <div className="absolute bottom-8 right-0 hidden justify-end p-4 lg:flex">
      <div className="relative">
        <Button onClick={handleToogleSidebar} variant="secondary">
          Open Chat
        </Button>
        {chatNotification && !isSidebarOpen && <ChatNotificationDot />}
      </div>
      <ChatSidebar
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarOpen={isSidebarOpen}
      />
    </div>
  );
}
