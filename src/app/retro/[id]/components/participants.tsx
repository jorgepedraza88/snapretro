"use client";

import { useEffect, useState } from "react";
import {
  HiUserGroup as UsersIcon,
  HiTrash as RemoveIcon,
} from "react-icons/hi2";
import { FaCrown as CrownIcon } from "react-icons/fa";

import { socket } from "@/socket";
import { useParams } from "next/navigation";
import { editRetroAdminId, Participant, revalidate } from "@/app/postActions";
import { useUserSession } from "@/hooks/user-session-context";
import { Button } from "@/components/ui/button";

export function Participants({ adminId }: { adminId: string }) {
  const { userSession } = useUserSession();
  const { id: retrospectiveId } = useParams<{ id: string }>();

  const [participants, setParticipants] = useState<Participant[]>([]);

  const isAdmin = adminId === userSession?.id;

  console.log(adminId);

  useEffect(() => {
    const socketId = socket.id;
    socket.emit("get-active-users", retrospectiveId);

    // Listen for updates to the active participants
    socket.on("active-users", (users) => {
      setParticipants(users); // Update the state with the new participants list
    });

    socket.on("assign-new-admin", async (newAdminId: string) => {
      if (newAdminId === socketId && userSession) {
        await editRetroAdminId({
          retrospectiveId,
          adminId: userSession.id,
        });
        // TODO: Mostrar un toast de que el usuario es ahora el host
      }
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off("active-users");
      socket.off("assign-new-admin");
    };
  }, [retrospectiveId, adminId]);

  const handleRemoveUser = (userId: string) => {
    socket.emit("disconnect-user", retrospectiveId, userId);
  };

  const handleChangeAdmin = (userId: string) => {
    socket.emit("assign-new-admin", retrospectiveId, userId);
  };

  return (
    <div className="space-y-1 p-8 max-w-60">
      <div className="bg-neutral-200 rounded-lg flex gap-1 items-center text-sm w-fit px-2 py-1">
        <div className="size-2 rounded-full bg-green-500" />
        <UsersIcon size={16} /> {participants.length}
      </div>
      {participants.map((participant) => (
        <div
          key={participant.id}
          className="bg-neutral-100 rounded-lg p-2 text-sm truncate flex items-center justify-between group"
        >
          <div>
            <p>{participant.username}</p>
            {participant.isAdmin && (
              <span className="text-xs text-neutral-500">Host</span>
            )}
          </div>

          {isAdmin && (
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="invisible size-0 px-4 py-3 group-hover:visible text-yellow-500 hover:text-yellow-600"
                onClick={() => handleChangeAdmin(participant.id)}
              >
                <CrownIcon size={16} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="invisible size-0 px-4 py-3 group-hover:visible"
                onClick={() => handleRemoveUser(participant.id)}
              >
                <RemoveIcon size={16} />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
