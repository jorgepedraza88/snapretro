import { NavBar } from "@/components/NavBars";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/AppSidebar";

export default async function RetroLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider defaultOpen={false}>
      <SidebarInset>
        <NavBar />
        <main className="size-full bg-neutral-50 dark:bg-neutral-800">
          {children}
        </main>
      </SidebarInset>
      <AppSidebar />
    </SidebarProvider>
  );
}
