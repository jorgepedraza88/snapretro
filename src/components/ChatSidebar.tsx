'use client';

import { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import { useParams } from 'next/navigation';

import REALTIME_EVENT_KEYS from '@/constants/realtimeEventKeys';
import { usePresenceStore } from '@/stores/usePresenceStore';
import { supabase } from '@/supabaseClient';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Sheet, SheetClose, SheetContent, SheetTitle } from './ui/sheet';

interface UserMessage {
  id: string | null;
  name: string;
  text: string;
}

interface AppSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ChatSidebar({ isSidebarOpen, setIsSidebarOpen }: AppSidebarProps) {
  const { id: retrospectiveId } = useParams<{ id: string }>();
  const currentUser = usePresenceStore((state) => state.currentUser);

  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    const channel = supabase.channel(`messages:${retrospectiveId}`);

    channel
      .on('broadcast', { event: REALTIME_EVENT_KEYS.CHAT }, ({ payload }) => {
        setMessages((prev) => [...prev, payload]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [retrospectiveId]);

  const sendMessage = () => {
    if (inputMessage.trim()) {
      const messageId = nanoid(5);

      supabase.channel(`messages:${retrospectiveId}`).send({
        type: 'broadcast',
        event: REALTIME_EVENT_KEYS.CHAT,
        payload: {
          id: messageId,
          name: currentUser.name,
          text: inputMessage
        }
      });

      supabase.channel(`notifications:${retrospectiveId}`).send({
        type: 'broadcast',
        event: REALTIME_EVENT_KEYS.CHAT_NOTIFICATION,
        payload: { user: currentUser.id }
      });

      setInputMessage('');
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <SheetContent
        className="flex flex-col justify-between bg-neutral-100 dark:bg-neutral-800"
        side="right"
      >
        <SheetTitle className="sr-only">Chat panel</SheetTitle>
        <div className="p-2 text-sm">
          {messages.map((msg) => (
            <p
              key={msg.id}
              style={{
                textAlign: msg.name === currentUser.name ? 'right' : 'left'
              }}
              className="my-2 rounded-lg border bg-white p-2"
            >
              {msg.name === currentUser.name ? (
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
        <div>
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
          <SheetClose asChild>
            <Button variant="secondary" className="mt-4 w-full">
              Close Chat
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
