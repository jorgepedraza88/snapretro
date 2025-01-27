"use client";

import { HiClock as TimerIcon } from "react-icons/hi2";
import { useState, useEffect } from "react";
import {
  HiMiniPlay as PlayIcon,
  HiMiniPause as PauseIcon,
  HiArrowPathRoundedSquare as ArrowIcon,
} from "react-icons/hi2";

import { Button } from "./ui/button";
import { useRetroContext } from "@/app/retro/[id]/components/RetroContextProvider";
import { supabase } from "@/supabaseClient";

interface CountdownTimerProps {
  adminId: string;
  defaultSeconds?: number;
}

type TimerState = "on" | "off" | "finished";

const DEFAULT_SECONDS = 300;

export function CountdownTimer({
  defaultSeconds = DEFAULT_SECONDS,
}: CountdownTimerProps) {
  const { isCurrentUserAdmin, retrospectiveId } = useRetroContext();

  const [timeLeft, setTimeLeft] = useState(defaultSeconds);
  const [timerState, setTimerState] = useState<TimerState>("off");

  const channelId = `retrospective:${retrospectiveId}`;

  useEffect(() => {
    const channel = supabase.channel(channelId);

    channel
      .on("broadcast", { event: "timer" }, ({ payload }) => {
        if (isCurrentUserAdmin) return;
        setTimerState(payload.timerState);
      })
      .on("broadcast", { event: "reset-timer" }, () => {
        if (isCurrentUserAdmin) return;

        setTimerState("off");
        setTimeLeft(defaultSeconds);
      });
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      setTimerState("finished");
      return;
    }

    if (timerState === "on") {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, timerState]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const startTimer = () => {
    setTimerState("on");

    supabase.channel(channelId).send({
      type: "broadcast",
      event: "timer",
      payload: { timerState: "on" },
    });
  };

  const pauseTimer = () => {
    setTimerState("off");

    supabase.channel(channelId).send({
      type: "broadcast",
      event: "timer",
      payload: { timerState: "off" },
    });
  };

  const handleResetTimer = () => {
    setTimerState("off");
    setTimeLeft(defaultSeconds);

    supabase.channel(channelId).send({
      type: "broadcast",
      event: "reset-timer",
      payload: {},
    });
  };

  return (
    <div className="flex gap-2 items-center mb-2">
      {isCurrentUserAdmin && timerState !== "finished" && (
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
      {isCurrentUserAdmin && (
        <Button size="sm" variant="outline" onClick={handleResetTimer}>
          <ArrowIcon size={16} />
          Reset
        </Button>
      )}
    </div>
  );
}
