'use client';

import { FaCrown as CrownIcon } from 'react-icons/fa';
import { HiTrash as RemoveIcon, HiUserGroup as UsersIcon } from 'react-icons/hi2';
import { useParams } from 'next/navigation';
import { useShallow } from 'zustand/shallow';

import { useRealtimeActions } from '@/hooks/useRealtimeActions';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePresenceStore } from '@/stores/usePresenceStore';

export function OnlineUsers() {
  const { id: retrospectiveId } = useParams<{ id: string }>();
  const { removeUserBroadcast, changeAdminBroadcast } = useRealtimeActions();
  const { currentUser, onlineUsers, adminId } = usePresenceStore(
    useShallow((state) => ({
      adminId: state.adminId,
      currentUser: state.currentUser,
      onlineUsers: state.onlineUsers
    }))
  );

  const isCurrentUserAdmin = adminId === currentUser.id;

  const handleRemoveUser = async (userId: string) => {
    removeUserBroadcast(retrospectiveId, userId);
  };

  const handleChangeAdmin = async (userId: string) => {
    if (userId !== currentUser.id) {
      changeAdminBroadcast(retrospectiveId, userId);
    }
  };

  if (onlineUsers.length === 0) {
    // TODO: Añadir un skeleton loader
    return 'Loading...';
  }

  return (
    <div className="absolute right-0 top-0 flex w-full min-w-full max-w-60 items-center justify-end gap-2 space-y-1 px-4 py-2">
      <TooltipProvider>
        <div className="flex w-fit items-center gap-1 rounded-lg bg-neutral-200 px-2 py-1 text-sm">
          <div className="size-2 rounded-full bg-green-500" />
          <UsersIcon size={16} /> {onlineUsers.length}
        </div>
        {onlineUsers.map((user, index) => (
          <div
            key={`user.id_${index}`}
            className="group flex min-w-20 items-center justify-between truncate rounded-lg bg-neutral-100 px-2 py-1 text-sm"
          >
            <div className="flex gap-1">
              {user.id === adminId && <CrownIcon size={16} className="mt-px text-yellow-500" />}
              <p>{user.name}</p>
            </div>

            {isCurrentUserAdmin && (
              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="invisible size-0 px-4 py-3 text-yellow-500 hover:text-yellow-600 group-hover:visible"
                      onClick={() => handleChangeAdmin(user.id)}
                    >
                      <CrownIcon size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="border-0 bg-violet-100 text-xs text-violet-900 hover:bg-violet-100/80 dark:bg-violet-800 dark:text-violet-50 dark:hover:bg-violet-800/80">
                    Assign as host
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="invisible size-0 px-4 py-3 group-hover:visible"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      <RemoveIcon size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="border-0 bg-violet-100 text-xs text-violet-900 hover:bg-violet-100/80 dark:bg-violet-800 dark:text-violet-50 dark:hover:bg-violet-800/80">
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
