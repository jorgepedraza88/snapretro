"use client";

import { useEffect, useState } from "react";
import {
  HiUserGroup as UsersIcon,
  HiTrash as RemoveIcon,
} from "react-icons/hi2";
import { FaCrown as CrownIcon } from "react-icons/fa";

import { socket } from "@/socket";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { editRetroAdminId, revalidate } from "@/app/actions";
import { useUserSession } from "@/hooks/user-session-context";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Participant {
  id: string;
  username: string;
  isAdmin: boolean;
}

export function Participants({ adminId }: { adminId: string }) {
  const { id: retrospectiveId } = useParams<{ id: string }>();
  const { userSession } = useUserSession();
  const { toast } = useToast();

  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    const socketId = socket.id;
    socket.emit("get-active-users", retrospectiveId);

    // Listen for updates to the active participants
    socket.on("active-users", (users) => {
      setParticipants(users); // Update the state with the new participants list
    });

    socket.on(
      "assign-new-admin",
      async (
        newAdminId: string,
        users: { id: string; username: string; isAdmin: boolean }[],
      ) => {
        if (newAdminId === socketId && userSession) {
          await editRetroAdminId({
            retrospectiveId,
            adminId: userSession.id,
          });
          toast({
            title: "You are now the host",
          });
        } else {
          revalidate();
          const newAdmin = users.find((p) => p.id === newAdminId);
          toast({
            title: `${newAdmin?.username} is now the host`,
          });
        }
      },
    );

    // Cleanup listeners on unmount
    return () => {
      socket.off("active-users");
      socket.off("assign-new-admin");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retrospectiveId, userSession]);

  if (!userSession) {
    return null;
  }

  const isCurrentUserAdmin = adminId === userSession.id;

  const handleRemoveUser = (userId: string) => {
    socket.emit("disconnect-user", retrospectiveId, userId);
  };

  const handleChangeAdmin = (userId: string) => {
    socket.emit("assign-new-admin", retrospectiveId, userId);
  };

  return (
    <div className="space-y-1 p-8 max-w-60">
      <TooltipProvider>
        <div className="bg-neutral-200 rounded-lg flex gap-1 items-center text-sm w-fit px-2 py-1">
          <div className="size-2 rounded-full bg-green-500" />
          <UsersIcon size={16} /> {participants.length}
        </div>
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="bg-neutral-100 rounded-lg p-2 text-sm truncate flex items-center justify-between group"
          >
            <div className="flex gap-1">
              {participant.isAdmin && (
                <CrownIcon size={16} className="mt-px text-yellow-500" />
              )}
              <p>{participant.username}</p>
            </div>

            {isCurrentUserAdmin && participant.id !== socket.id && (
              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="invisible size-0 px-4 py-3 group-hover:visible text-yellow-500 hover:text-yellow-600"
                      onClick={() => handleChangeAdmin(participant.id)}
                    >
                      <CrownIcon size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-violet-100 text-violet-900 hover:bg-violet-100/80 dark:bg-violet-800 dark:text-violet-50 dark:hover:bg-violet-800/80 border-0 text-xs">
                    Assign as host
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="invisible size-0 px-4 py-3 group-hover:visible"
                      onClick={() => handleRemoveUser(participant.id)}
                    >
                      <RemoveIcon size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-violet-100 text-violet-900 hover:bg-violet-100/80 dark:bg-violet-800 dark:text-violet-50 dark:hover:bg-violet-800/80 border-0 text-xs">
                    Remove user
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        ))}
      </TooltipProvider>
    </div>
  );
}
