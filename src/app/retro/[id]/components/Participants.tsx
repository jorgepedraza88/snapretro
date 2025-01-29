/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  HiUserGroup as UsersIcon,
  HiTrash as RemoveIcon,
} from "react-icons/hi2";
import { FaCrown as CrownIcon } from "react-icons/fa";

import { editRetroAdminId } from "@/app/actions";
import { useUserSession } from "@/components/UserSessionContext";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRetroContext } from "./RetroContextProvider";

import { removeUserBroadcast } from "@/hooks/useRealtimeActions";

export function Participants() {
  const { userSession } = useUserSession();
  const { retrospectiveId, participants, isCurrentUserAdmin } =
    useRetroContext();

  if (!userSession) {
    return null;
  }

  const handleRemoveUser = async (userId: string) => {
    await removeUserBroadcast(retrospectiveId, userId);
  };

  const handleChangeAdmin = async (userId: string) => {
    if (userId !== userSession.id) {
      await editRetroAdminId({
        retrospectiveId,
        newAdminId: userId,
      });
    }
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

            {/* {isCurrentUserAdmin && (
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
            )} */}
          </div>
        ))}
      </TooltipProvider>
    </div>
  );
}
