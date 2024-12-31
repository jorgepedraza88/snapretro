"use client";
import { HiClock as TimerIcon } from "react-icons/hi2";
import { useState, useEffect } from "react";
import {
  HiMiniPlay as PlayIcon,
  HiMiniPause as PauseIcon,
  HiArrowPathRoundedSquare as ArrowIcon,
} from "react-icons/hi2";

import { socket } from "@/socket";
import { Button } from "./ui/button";
import { useUserSession } from "@/hooks/user-session-context";
import { useParams } from "next/navigation";

interface CountdownTimerProps {
  adminId: string;
  defaultSeconds?: number;
}

const CountdownTimer = ({
  adminId,
  defaultSeconds = 300,
}: CountdownTimerProps) => {
  const { userSession } = useUserSession();
  const { id: retroSpectiveId } = useParams<{ id: string }>();

  const [timeLeft, setTimeLeft] = useState(defaultSeconds);
  const [timerState, setTimerState] = useState<
    "running" | "paused" | "finished"
  >("paused");

  const isCurrentUserAdmin = adminId === userSession?.id;

  useEffect(() => {
    socket.on("timer-state", (state) => {
      setTimerState(state);
    });

    socket.on("reset-timer", () => {
      setTimerState("paused");
      setTimeLeft(defaultSeconds);
    });

    if (timeLeft <= 0) {
      setTimerState("finished");
      return;
    }

    if (timerState === "running") {
      socket.emit("timer-state", retroSpectiveId, timerState);
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    }

    if (timerState === "paused") {
      socket.emit("timer-state", retroSpectiveId, timerState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, timerState]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleResetTimer = () => {
    setTimerState("paused");
    setTimeLeft(defaultSeconds);
    socket.emit("reset-timer", retroSpectiveId);
  };

  return (
    <div className="flex gap-2 items-center mb-2">
      {isCurrentUserAdmin && timerState !== "finished" && (
        <div>
          {timerState !== "running" && (
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
      <div className="bg-violet-600 rounded-lg px-2 py-1.5 flex items-center gap-2 text-neutral-100">
        <TimerIcon size={16} /> {formatTime(timeLeft)}
      </div>
      {isCurrentUserAdmin && (
        <Button size="sm" variant="outline" onClick={handleResetTimer}>
          <ArrowIcon size={16} />
          Reset
        </Button>
      )}
    </div>
  );
};

export default CountdownTimer;
