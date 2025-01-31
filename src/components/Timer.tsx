"use client";

import { HiClock as TimerIcon } from "react-icons/hi2";
import { useEffect } from "react";
import {
  HiMiniPlay as PlayIcon,
  HiMiniPause as PauseIcon,
  HiArrowPathRoundedSquare as ArrowIcon,
} from "react-icons/hi2";

import { Button } from "./ui/button";
import { useRealtimeActions } from "@/hooks/useRealtimeActions";
import { useAdminStore } from "@/stores/useAdminStore";
import { useRetroContext } from "@/app/retro/[id]/components/RetroContextProvider";
import { usePresenceStore } from "@/stores/usePresenceStore";

export function Timer() {
  const { retrospectiveId, defaultSeconds } = useRetroContext();
  const currentUser = usePresenceStore((state) => state.currentUser);

  const { timerState, timeLeft, setTimerState, setTimeLeft } = useAdminStore();
  const { handleTimerBroadcast } = useRealtimeActions();

  useEffect(() => {
    if (timeLeft <= 0) {
      setTimerState("finished");
      return;
    }

    if (timerState === "on") {
      const timer = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, timerState]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const startTimer = async () => {
    setTimerState("on");

    handleTimerBroadcast(retrospectiveId, "on");
  };

  const pauseTimer = async () => {
    setTimerState("off");

    handleTimerBroadcast(retrospectiveId, "off");
  };

  const handleResetTimer = async () => {
    setTimerState("off");
    setTimeLeft(defaultSeconds);

    handleTimerBroadcast(retrospectiveId, "reset");
  };

  return (
    <div className="flex gap-2 items-center mb-2">
      {currentUser.isAdmin && timerState !== "finished" && (
        <div>
          {timerState !== "on" && (
            <Button size="sm" variant="outline" onClick={startTimer}>
              <PlayIcon size={16} />
            </Button>
          )}
          {timerState === "on" && (
            <Button size="sm" variant="outline" onClick={pauseTimer}>
              <PauseIcon size={16} />
            </Button>
          )}
        </div>
      )}
      <div className="bg-violet-600 rounded-lg px-2 py-1.5 flex items-center gap-2 text-neutral-100">
        <TimerIcon size={16} /> {formatTime(timeLeft)}
      </div>
      {currentUser.isAdmin && (
        <Button size="sm" variant="outline" onClick={handleResetTimer}>
          <ArrowIcon size={16} />
          Reset
        </Button>
      )}
    </div>
  );
}
