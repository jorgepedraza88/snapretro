"use client";

import { useEffect, useState } from "react";
import { nanoid } from "nanoid";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from "./ui/sidebar";
import { useUserSession } from "@/components/UserSessionContext";
import { useParams } from "next/navigation";
import { supabase } from "@/supabaseClient";

interface UserMessage {
  id: string | null;
  name: string;
  text: string;
}

export function AppSidebar() {
  const { id: retrospectiveId } = useParams<{ id: string }>();
  const { userSession } = useUserSession();

  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    const channel = supabase.channel(`messages:${retrospectiveId}`);

    channel
      .on("broadcast", { event: "chat" }, ({ payload }) => {
        setMessages((prev) => [...prev, payload]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [retrospectiveId]);

  const sendMessage = () => {
    if (inputMessage.trim() && userSession) {
      const messageId = nanoid(5);

      supabase.channel(`messages:${retrospectiveId}`).send({
        type: "broadcast",
        event: "chat",
        payload: {
          id: messageId,
          name: userSession.name,
          text: inputMessage,
        },
      });

      supabase.channel(`notifications:${retrospectiveId}`).send({
        type: "broadcast",
        event: "chat-notification",
        payload: { user: userSession.id },
      });

      setInputMessage("");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage();
  };

  if (!userSession) {
    return null;
  }

  return (
    <Sidebar side="right" variant="inset" className="border-l">
      <SidebarContent className="dark:bg-neutral-800">
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
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            autoFocus
          />
          <Button variant="secondary" type="submit">
            Send
          </Button>
        </form>
        <Button variant="secondary" onClick={toggleSidebar}>
          Close Chat
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
