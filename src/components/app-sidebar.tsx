"use client";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from "./ui/sidebar";

let socket: Socket;

export function AppSidebar() {
  const [messages, setMessages] = useState<
    { id: string | null; text: string }[]
  >([]);
  const [message, setMessage] = useState("");
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    socket = io();

    socket.on("connect", () => {
      console.log("Connected to server in chat");
      // TODO: Podriamos tener un context para esto
      if (socket.id) {
        setSocketId(socket.id);
      }
    });

    socket.on("message", (msg: { id: string; text: string }) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("message", { id: socket.id, text: message });
      setMessages((prev) => [...prev, { id: socketId, text: message }]);
      setMessage("");
    }
  };

  const { toggleSidebar } = useSidebar();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <Sidebar side="right">
      <SidebarContent>
        <div className="p-2 text-sm">
          {messages.map((msg, idx) => (
            <p
              key={idx}
              style={{
                textAlign: msg.id === socketId ? "right" : "left",
              }}
              className="bg-white my-2 p-2 rounded-lg border"
            >
              {msg.id === socketId ? msg.text : `${msg.id}: ${msg.text}`}
            </p>
          ))}
        </div>
      </SidebarContent>
      <SidebarFooter>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px" }}>
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
