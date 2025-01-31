import { create } from "zustand";

type AdminSettings = {
  allowMessages: boolean;
  allowVotes: boolean;
  useSummaryAI: boolean;
};

type TimerStateValues = "on" | "off" | "finished";

const DEFAULT_TIMELEFT = 300;

type AdminState = {
  settings: AdminSettings;
  timerState: TimerStateValues;
  timeLeft: number;
  defaultSeconds: number;
  setSettings: (settings: Partial<AdminSettings>) => void;
  setTimerState: (state: TimerStateValues) => void;
  setTimeLeft: (time: number) => void;
};

export const useAdminStore = create<AdminState>((set) => ({
  settings: {
    allowMessages: true,
    allowVotes: true,
    useSummaryAI: true,
  },
  timerState: "off",
  timeLeft: DEFAULT_TIMELEFT,
  defaultSeconds: DEFAULT_TIMELEFT,

  setSettings: (newSettings: Partial<AdminSettings>) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
  setTimerState: (timerState) => set({ timerState }),
  setTimeLeft: (timeLeft) => set({ timeLeft }),
}));
