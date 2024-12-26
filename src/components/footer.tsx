"use client";
import { Button } from "./ui/button";
import { useSidebar } from "./ui/sidebar";

export function Footer() {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="w-full absolute bottom-0 flex justify-center p-4">
      <Button onClick={toggleSidebar} variant="secondary">
        Open Chat
      </Button>
    </div>
  );
}
