import { NavBar } from "@/components/NavBar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/AppSidebar";
import { ChannelProvider } from "@/components/RealtimeProvider";

export default async function RetroLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ChannelProvider>
      <SidebarProvider defaultOpen={false}>
        <SidebarInset>
          <NavBar />
          <main className="size-full bg-neutral-50 dark:bg-neutral-800">
            {children}
          </main>
        </SidebarInset>
        <AppSidebar />
      </SidebarProvider>
    </ChannelProvider>
  );
}
