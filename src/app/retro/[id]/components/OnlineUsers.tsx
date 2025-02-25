'use client';

import { FaCrown as CrownIcon } from 'react-icons/fa';
import { useShallow } from 'zustand/shallow';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePresenceStore } from '@/stores/usePresenceStore';

export function OnlineUsers() {
  const { onlineUsers, adminId } = usePresenceStore(
    useShallow((state) => ({
      adminId: state.adminId,
      currentUser: state.currentUser,
      onlineUsers: state.onlineUsers
    }))
  );

  const adminUserId = onlineUsers.find((user) => user.id === adminId)?.id;

  if (onlineUsers.length === 0) {
    return null;
  }

  const sortedOnlineUsersByAdmin = onlineUsers.sort((a, b) => {
    if (a.id === adminUserId) {
      return -1;
    }
    if (b.id === adminUserId) {
      return 1;
    }
    return 0;
  });

  console.log('adminUserId', adminUserId);
  console.log('onlineUsers', onlineUsers);

  return (
    <div>
      <TooltipProvider>
        <div className="flex">
          {sortedOnlineUsersByAdmin.map((user, index) => (
            <div
              key={`user.id_${index}`}
              className="group -ml-3 flex items-center justify-between text-sm"
            >
              <div className="relative">
                {user.id === adminUserId && (
                  <CrownIcon
                    size={14}
                    className="absolute -top-1 left-[13px] z-10 text-yellow-500"
                  />
                )}
                <Tooltip>
                  <TooltipTrigger>
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback className="cursor-pointer border-2 border-violet-200 bg-violet-100 text-violet-900">
                        {user.name.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{user.name}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}
