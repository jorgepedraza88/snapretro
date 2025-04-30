import { create } from 'zustand';

type TimerStateValues = 'on' | 'off' | 'finished';

const DEFAULT_TIMELEFT = 300;

type AdminState = {
  useSummaryAI: boolean;
  timerState: TimerStateValues;
  timeLeft: number;
  defaultSeconds: number;
  setUseSummaryAI: (useSummaryAI: boolean) => void;
  setTimerState: (state: TimerStateValues) => void;
  setTimeLeft: (time: number) => void;
};

export const useAdminStore = create<AdminState>((set) => ({
  useSummaryAI: false,
  timerState: 'off',
  timeLeft: DEFAULT_TIMELEFT,
  defaultSeconds: DEFAULT_TIMELEFT,

  setTimerState: (timerState) => set({ timerState }),
  setTimeLeft: (timeLeft) => set({ timeLeft }),
  setUseSummaryAI: (useSummaryAI) => set({ useSummaryAI })
}));
