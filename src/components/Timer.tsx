'use client';

import { useEffect } from 'react';
import {
  HiArrowPathRoundedSquare as ArrowIcon,
  HiMiniPause as PauseIcon,
  HiMiniPlay as PlayIcon,
  HiClock as TimerIcon
} from 'react-icons/hi2';

import { useRealtimeActions } from '@/hooks/useRealtimeActions';
import { useRetroContext } from '@/app/retro/[id]/components/RetroContextProvider';
import { useAdminStore } from '@/stores/useAdminStore';
import { usePresenceStore } from '@/stores/usePresenceStore';
import { Button } from './ui/button';

export function Timer() {
  const { retrospectiveId, defaultSeconds } = useRetroContext();
  const currentUser = usePresenceStore((state) => state.currentUser);

  const { timerState, timeLeft, setTimerState, setTimeLeft } = useAdminStore();
  const { handleTimerBroadcast } = useRealtimeActions();

  useEffect(() => {
    if (timeLeft <= 0) {
      setTimerState('finished');
      return;
    }

    if (timerState === 'on') {
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
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const startTimer = async () => {
    setTimerState('on');

    handleTimerBroadcast(retrospectiveId, 'on');
  };

  const pauseTimer = async () => {
    setTimerState('off');

    handleTimerBroadcast(retrospectiveId, 'off');
  };

  const handleResetTimer = async () => {
    setTimerState('off');
    setTimeLeft(defaultSeconds);

    handleTimerBroadcast(retrospectiveId, 'reset');
  };

  return (
    <div className="mb-2 flex items-center gap-2">
      {currentUser.isAdmin && timerState !== 'finished' && (
        <div>
          {timerState !== 'on' && (
            <Button size="sm" variant="outline" onClick={startTimer}>
              <PlayIcon size={16} />
            </Button>
          )}
          {timerState === 'on' && (
            <Button size="sm" variant="outline" onClick={pauseTimer}>
              <PauseIcon size={16} />
            </Button>
          )}
        </div>
      )}
      <div className="flex items-center gap-2 rounded-lg bg-violet-600 px-2 py-1.5 text-neutral-100">
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
