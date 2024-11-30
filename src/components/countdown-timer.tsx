"use client";
import { HiClock as TimerIcon } from "react-icons/hi2";

import { useState, useEffect } from "react";

const CountdownTimer = ({ initialSeconds = 300 }) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      console.log("Finished time");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div>
      <div className="bg-green-300 rounded-lg px-2 py-1 mb-2 flex items-center gap-2 text-gray-800">
        <TimerIcon size={16} /> {formatTime(timeLeft)}
      </div>
    </div>
  );
};

export default CountdownTimer;
