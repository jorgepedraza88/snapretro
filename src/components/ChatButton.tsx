'use client';

import { useEffect, useState } from 'react';
import { HiChatBubbleLeftRight } from 'react-icons/hi2';
import { useParams } from 'next/navigation';

import REALTIME_EVENT_KEYS from '@/constants/realtimeEventKeys';
import { usePresenceStore } from '@/stores/usePresenceStore';
import { supabase } from '@/supabaseClient';
import { ChatSidebar } from './ChatSidebar';

function ChatNotificationDot() {
  return (
    <>
      <span className="absolute right-1 top-1 inline-flex size-2 animate-ping rounded-full bg-red-400 opacity-75"></span>
      <span className="absolute right-1 top-1 inline-flex size-2 rounded-full bg-red-500"></span>
    </>
  );
}

export function ChatButton() {
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
      .on('broadcast', { event: REALTIME_EVENT_KEYS.CHAT_NOTIFICATION }, ({ payload }) => {
        if (payload.user !== currentUser.id) {
          setChatNotification(true);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [retrospectiveId, currentUser.id]);

  return (
    <div>
      <div className="relative mr-2 mt-1 px-2">
        <button type="button" onClick={handleToogleSidebar}>
          <HiChatBubbleLeftRight
            size={24}
            className="mt-1 shrink-0 cursor-pointer text-violet-500 transition-colors hover:text-violet-600"
          />
        </button>
        {chatNotification && !isSidebarOpen && <ChatNotificationDot />}
      </div>
      <ChatSidebar setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} />
    </div>
  );
}
