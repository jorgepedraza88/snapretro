"use client";

import { HiChatBubbleLeft as ChatIcon } from "react-icons/hi2";
import { Button } from "./ui/button";
import { useSidebar } from "./ui/sidebar";

export function Footer() {
  const { toggleSidebar } = useSidebar();
  return (
    <div className="w-full absolute bottom-0 flex justify-center p-4">
      <Button
        size="icon"
        onClick={toggleSidebar}
        variant="secondary"
        className="size-14 [&_svg]:size-12"
      >
        <ChatIcon size={80} className="shrink-0" />
      </Button>
    </div>
  );
}
