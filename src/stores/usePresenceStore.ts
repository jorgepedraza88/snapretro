import { RealtimeChannel } from '@supabase/supabase-js';
import { create } from 'zustand';

export type UserPresence = {
  id: string;
  name: string;
  avatarUrl?: string;
  hasBeenDisconnected?: boolean;
  symmetricKey?: string;
};

type PresenceState = {
  onlineUsers: UserPresence[];
  currentUser: UserPresence;
  channel: RealtimeChannel | null;
  adminId: string | null;
  symmetricKey?: string;
  participantHistory: UserPresence[];
  setSymmetricKey: (key: string) => void;
  setAdminId: (adminId: string) => void;
  setChannel: (channel: RealtimeChannel | null) => void;
  setCurrentUser: (user: UserPresence) => void;
  getCurrentUser: () => UserPresence;
  updateOnlineUsers: (users: UserPresence[]) => void;
  addToParticipantHistory: (user: UserPresence) => void;
  handleAdminChange: (newAdminId: string, oldAdminId?: string) => Promise<void>;
};

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUsers: [],
  currentUser: { id: 'guest', name: 'Guest', isAdmin: false },
  channel: null,
  adminId: null,
  symmetricKey: undefined,
  participantHistory: [],

  setSymmetricKey: (symmetricKey: string) => set({ symmetricKey }),
  setAdminId: (adminId) => set({ adminId }),
  setChannel: (channel) => set({ channel }),
  getCurrentUser: () => get().currentUser,
  setCurrentUser: (user) => set({ currentUser: user }),
  updateOnlineUsers: (users) => set({ onlineUsers: users }),

  addToParticipantHistory: (user) => {
    const { participantHistory } = get();
    const userExists = participantHistory.some((participant) => participant.id === user.id);

    if (!userExists) {
      set({ participantHistory: [...participantHistory, user] });
    }
  },

  handleAdminChange: async (newAdminId) => {
    const { channel } = get();

    // If there is not supabase channel subscription yet, we can't execute this
    if (!channel) {
      return;
    }

    set({ adminId: newAdminId });
  }
}));
