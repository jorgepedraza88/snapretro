"use client";
import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { socket } from "@/socket";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from "./ui/sidebar";
import { useUserSession } from "@/hooks/user-session-context";

interface UserMessage {
  id: string | null;
  name: string;
  text: string;
}

export function AppSidebar() {
  const { userSession } = useUserSession();
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.on("message", (msg: { id: string; name: string; text: string }) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() && userSession) {
      const messageId = nanoid(5);
      socket.emit("message", {
        id: messageId,
        name: userSession.name,
        text: message,
      });
      setMessages((prev) => [
        ...prev,
        { id: messageId, name: userSession.name, text: message },
      ]);
      setMessage("");
    }
  };

  const { toggleSidebar } = useSidebar();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage();
  };

  if (!userSession) {
    return null;
  }

  return (
    <Sidebar side="right">
      <SidebarContent>
        <div className="p-2 text-sm">
          {messages.map((msg) => (
            <p
              key={msg.id}
              style={{
                textAlign: msg.name === userSession.name ? "right" : "left",
              }}
              className="bg-white my-2 p-2 rounded-lg border"
            >
              {msg.name === userSession.name ? (
                msg.text
              ) : (
                <span>
                  <strong>{msg.name}: </strong>
                  {msg.text}
                </span>
              )}
            </p>
          ))}
        </div>
      </SidebarContent>
      <SidebarFooter>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="secondary" type="submit">
            Send
          </Button>
        </form>
        <Button variant="secondary" onClick={toggleSidebar}>
          Open/Close Chat
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
