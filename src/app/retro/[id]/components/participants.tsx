"use client";

import { useEffect, useState } from "react";
import {
  HiUserGroup as UsersIcon,
  HiTrash as RemoveIcon,
} from "react-icons/hi2";

import { socket } from "@/socket";
import { useParams } from "next/navigation";
import { Participant } from "@/app/postActions";
import { useUserSession } from "@/hooks/user-session-context";
import { Button } from "@/components/ui/button";

export function Participants({ adminId }: { adminId: string }) {
  const { userSession } = useUserSession();
  const params = useParams<{ id: string }>();
  const [participants, setParticipants] = useState<Participant[]>([]);

  const isAdmin = adminId === userSession?.id;

  useEffect(() => {
    // Listen for updates to the active participants
    socket.on("active-users", (users) => {
      setParticipants(users); // Update the state with the new participants list
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off("active-users");
    };
  }, [params.id]);

  return (
    <div className="space-y-2 p-8 max-w-60">
      <div className="bg-neutral-200 rounded-lg flex gap-1 items-center text-sm w-fit px-2 py-1">
        <UsersIcon size={16} /> {participants.length}
      </div>
      {participants.map((participant) => (
        <div
          key={participant.id}
          className="bg-neutral-100 rounded-lg p-2 text-sm truncate flex items-center justify-between group"
        >
          {participant.username}
          {isAdmin && (
            <Button
              size="icon"
              variant="ghost"
              className="invisible size-0 px-4 py-3 group-hover:visible"
            >
              <RemoveIcon size={16} />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
