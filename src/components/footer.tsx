"use client";
import { Button } from "./ui/button";
import { useSidebar } from "./ui/sidebar";

export function Footer() {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="w-full absolute bottom-0 hidden justify-center p-4 lg:flex">
      <Button onClick={toggleSidebar} variant="secondary">
        Open Chat
      </Button>
    </div>
  );
}
