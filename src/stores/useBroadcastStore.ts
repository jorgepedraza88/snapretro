import { create } from 'zustand';

type BroadcastMessage = {
  id: string;
  type: string;
  payload: unknown;
  sender: string;
  timestamp: Date;
};

type BroadcastState = {
  messages: BroadcastMessage[];
  sendMessage: (type: string, payload: unknown) => void;
  receiveMessage: (message: BroadcastMessage) => void;
};

export const useBroadcastStore = create<BroadcastState>((set) => ({
  messages: [],

  sendMessage: (type, payload) => {
    // Actual Supabase channel send logic will be in the subscription setup
  },

  receiveMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message].slice(-100) // Keep last 100 messages
    }))
}));
