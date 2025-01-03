"use client";
import {
  HiMiniSun as LightIcon,
  HiMiniMoon as DarkIcon,
} from "react-icons/hi2";

import { Button } from "./ui/button";
import { useState } from "react";

export function SwitchColorMode() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    document.documentElement.classList.contains("dark"),
  );

  const handleChangeMode = () => {
    // Change class in html tag
    document.documentElement.classList.toggle("dark");
    setIsDarkMode(!isDarkMode);
  };

  return (
    <Button variant="ghost" onClick={handleChangeMode}>
      {!isDarkMode ? (
        <DarkIcon className="shrink-0" />
      ) : (
        <LightIcon className="shrink-0" />
      )}
    </Button>
  );
}
