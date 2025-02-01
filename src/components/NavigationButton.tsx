'use client';

import { useRouter } from 'next/navigation';

import { Button, ButtonProps } from './ui/button';

interface NavigationButtonProps extends ButtonProps {
  href: string;
}

export function NavigationButton(buttonProps: NavigationButtonProps) {
  const router = useRouter();
  const { children, href, ...props } = buttonProps;

  return (
    <Button onClick={() => router.push(href)} {...props}>
      {children}
    </Button>
  );
}
