"use client";
import { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useSidebar } from "./ui/sidebar";

import { socket } from "@/socket";

function ChatNotificationDot() {
  return (
    <>
      <span className="animate-ping absolute inline-flex size-[10px] rounded-full bg-red-400 opacity-75 -top-0.5 -right-0.5"></span>
      <span className="absolute inline-flex rounded-full size-[10px] bg-red-500 -top-0.5 -right-0.5"></span>
    </>
  );
}

export function Footer() {
  const { toggleSidebar, open } = useSidebar();
  const [chatNotification, setChatNotification] = useState(false);

  const handleSetNotification = useCallback(() => {
    // Set the notification only if the chat is closed
    if (!open) {
      setChatNotification(true);
    }
  }, [open]);

  const handleToogleSidebar = () => {
    // Remove the notification when opening the chat
    if (chatNotification) {
      setChatNotification(false);
    }
    toggleSidebar();
  };

  useEffect(() => {
    socket.on("message", handleSetNotification);

    return () => {
      socket.off("message", handleSetNotification);
    };
  }, [handleSetNotification]);

  return (
    <div className="w-full absolute bottom-8 hidden justify-center p-4 lg:flex">
      <div className="relative">
        <Button onClick={handleToogleSidebar} variant="secondary">
          Open Chat
        </Button>
        {chatNotification && <ChatNotificationDot />}
      </div>
    </div>
  );
}
