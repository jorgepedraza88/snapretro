import { create } from 'zustand';

import { supabase } from '@/supabaseClient';
import { useAdminStore } from './useAdminStore';

export type UserPresence = {
  id: string;
  name: string;
  avatarUrl?: string;
  isAdmin: boolean;
};

type PresenceState = {
  onlineUsers: UserPresence[];
  currentUser: UserPresence;
  setCurrentUser: (user: UserPresence) => void;
  getCurrentUser: () => UserPresence;
  updateOnlineUsers: (users: UserPresence[]) => void;
  handleAdminChange: (newAdminId: string, oldAdminId: string, retroId: string) => Promise<void>;
};

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUsers: [],
  currentUser: { id: 'guest', name: 'Guest', isAdmin: false },

  getCurrentUser: () => get().currentUser,

  setCurrentUser: (user) => set({ currentUser: user }),

  updateOnlineUsers: (users) => set({ onlineUsers: users }),

  handleAdminChange: async (newAdminId, oldAdminId, retroId) => {
    const { currentUser } = get();

    if (!currentUser) return;

    const channel = supabase.channel(`retrospective:${retroId}`);

    // Update local state first
    set({
      onlineUsers: get().onlineUsers.map((user) =>
        user.id === oldAdminId
          ? { ...user, isAdmin: false }
          : user.id === newAdminId
            ? { ...user, isAdmin: true }
            : user
      )
    });

    // Sync with server
    if (oldAdminId === currentUser.id) {
      await channel.track({ ...currentUser, isAdmin: false });
    }

    if (newAdminId === currentUser.id) {
      await channel.track({ ...currentUser, isAdmin: true });
    }

    // Update admin store if current user is involved
    const { setSettings } = useAdminStore.getState();

    if (newAdminId === currentUser.id || oldAdminId === currentUser.id) {
      setSettings({
        useSummaryAI: true,
        allowMessages: true,
        allowVotes: true
      });
    }
  }
}));
