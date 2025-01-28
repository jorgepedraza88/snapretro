"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useSidebar } from "./ui/sidebar";
import { supabase } from "@/supabaseClient";
import { useParams } from "next/navigation";
import { useUserSession } from "./UserSessionContext";

function ChatNotificationDot() {
  return (
    <>
      <span className="animate-ping absolute inline-flex size-[10px] rounded-full bg-red-400 opacity-75 -top-0.5 -right-0.5"></span>
      <span className="absolute inline-flex rounded-full size-[10px] bg-red-500 -top-0.5 -right-0.5"></span>
    </>
  );
}

export function Footer() {
  const { userSession } = useUserSession();
  const { id: retrospectiveId } = useParams<{ id: string }>();
  const { toggleSidebar, open } = useSidebar();

  const [chatNotification, setChatNotification] = useState(false);

  const handleToogleSidebar = () => {
    // Remove the notification when opening the chat
    if (chatNotification) {
      setChatNotification(false);
    }

    toggleSidebar();
  };

  useEffect(() => {
    const channel = supabase.channel(`notifications:${retrospectiveId}`);

    channel
      .on("broadcast", { event: "chat-notification" }, ({ payload }) => {
        if (payload.user !== userSession?.id) {
          setChatNotification(true);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [retrospectiveId, userSession?.id]);

  return (
    <div className="w-full absolute bottom-8 hidden justify-center p-4 lg:flex">
      <div className="relative">
        <Button onClick={handleToogleSidebar} variant="secondary">
          Open Chat
        </Button>
        {chatNotification && !open && <ChatNotificationDot />}
      </div>
    </div>
  );
}
