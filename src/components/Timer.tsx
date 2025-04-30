'use client';

import { useEffect } from 'react';
import {
  HiArrowPathRoundedSquare as ArrowIcon,
  HiMiniPause as PauseIcon,
  HiMiniPlay as PlayIcon,
  HiClock as TimerIcon
} from 'react-icons/hi2';
import { useParams } from 'next/navigation';
import { useShallow } from 'zustand/shallow';

import { useRealtimeActions } from '@/hooks/useRealtimeActions';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/stores/useAdminStore';
import { usePresenceStore } from '@/stores/usePresenceStore';
import { Button } from './ui/button';

export function Timer({ defaultTime }: { defaultTime: number }) {
  const { id: retrospectiveId } = useParams<{ id: string }>();
  const { currentUser, adminId } = usePresenceStore(
    useShallow((state) => ({
      adminId: state.adminId,
      currentUser: state.currentUser
    }))
  );

  const { timerState, timeLeft, setTimerState, setTimeLeft } = useAdminStore();

  const { handleTimerBroadcast } = useRealtimeActions();

  const isCurrentUserAdmin = adminId === currentUser.id;

  // Execute once when the component mounts to set the initial state of the timer
  useEffect(() => {
    setTimeLeft(defaultTime);
  }, []);

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
    setTimeLeft(defaultTime);

    handleTimerBroadcast(retrospectiveId, 'reset', defaultTime);
  };

  return (
    <div className="mb-2 flex items-center gap-2">
      {isCurrentUserAdmin && timerState !== 'finished' && (
        <div className="flex items-center gap-1">
          {timerState !== 'on' && (
            <Button
              size="sm"
              variant="ghost"
              className="size-8 rounded-full p-0"
              onClick={startTimer}
            >
              <PlayIcon size={16} />
            </Button>
          )}
          {timerState === 'on' && (
            <Button
              size="sm"
              variant="ghost"
              className="size-8 rounded-full p-0"
              onClick={pauseTimer}
            >
              <PauseIcon size={16} />
            </Button>
          )}
        </div>
      )}
      <div
        className={cn('flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium', {
          'rounded-lg bg-violet-200 text-violet-900 dark:bg-violet-900 dark:text-violet-200':
            timerState === 'on',
          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': timerState === 'finished'
        })}
      >
        <TimerIcon size={16} className={timerState === 'on' ? 'animate-pulse' : ''} />{' '}
        {formatTime(timeLeft)}
      </div>
      {isCurrentUserAdmin && (
        <Button
          size="sm"
          variant="ghost"
          className="size-8 rounded-full p-0"
          onClick={handleResetTimer}
          title="Reset timer"
        >
          <ArrowIcon size={16} />
          <span className="sr-only">Reset</span>
        </Button>
      )}
    </div>
  );
}
