"use client";
import { HiClock as TimerIcon } from "react-icons/hi2";
import { useState, useEffect } from "react";
import {
  HiMiniPlay as PlayIcon,
  HiMiniPause as PauseIcon,
} from "react-icons/hi2";

import { socket } from "@/socket";
import { Button } from "./ui/button";
import { useUserSession } from "@/hooks/user-session-context";

interface CountdownTimerProps {
  adminId: string;
  defaultSeconds?: number;
}

const CountdownTimer = ({
  adminId,
  defaultSeconds = 300,
}: CountdownTimerProps) => {
  const { userSession } = useUserSession();

  const [timeLeft, setTimeLeft] = useState(defaultSeconds);
  const [timerState, setTimerState] = useState<
    "running" | "paused" | "finished"
  >("paused");

  const isCurrentUserAdmin = adminId === userSession?.id;

  // TODO: Mejorar este useEffect
  useEffect(() => {
    socket.on("timer-state", (state) => {
      setTimerState(state);
    });

    if (timeLeft <= 0) {
      console.log("Finished time");
      return;
    }

    if (timerState === "running") {
      socket.emit("timer-state", timerState);
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    }

    if (timerState === "paused") {
      socket.emit("timer-state", timerState);
    }
  }, [timeLeft, timerState]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="flex gap-2 items-center mb-2">
      {isCurrentUserAdmin && (
        <div>
          {timerState !== "running" && isCurrentUserAdmin && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTimerState("running")}
            >
              <PlayIcon size={16} />
            </Button>
          )}
          {timerState === "running" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTimerState("paused")}
            >
              <PauseIcon size={16} />
            </Button>
          )}
        </div>
      )}
      <div className="bg-green-300 rounded-lg px-2 py-1 flex items-center gap-2 text-gray-800">
        <TimerIcon size={16} /> {formatTime(timeLeft)}
      </div>
    </div>
  );
};

export default CountdownTimer;
