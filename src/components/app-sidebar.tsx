"use client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from "./ui/sidebar";

export function AppSidebar() {
  const { toggleSidebar } = useSidebar();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submit");
  };

  return (
    <Sidebar side="right">
      <SidebarContent>Chat</SidebarContent>
      <SidebarFooter>
        <form onSubmit={handleSubmit}>
          <Input placeholder="Type a message" />
        </form>
        <Button variant="secondary" onClick={toggleSidebar}>
          Open/Close Chat
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
