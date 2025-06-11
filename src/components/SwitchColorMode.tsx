'use client';

import { useLayoutEffect, useState } from 'react';
import { HiMiniMoon as DarkIcon, HiMiniSun as LightIcon } from 'react-icons/hi2';

import { Button } from './ui/button';

export function SwitchColorMode() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const handleChangeMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
  };

  useLayoutEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  return (
    <Button variant="ghost" onClick={handleChangeMode} size="icon">
      {!isDarkMode ? (
        <DarkIcon className="shrink-0 text-violet-500 dark:text-violet-400" />
      ) : (
        <LightIcon className="shrink-0 text-violet-500 dark:text-violet-400" />
      )}
    </Button>
  );
}
