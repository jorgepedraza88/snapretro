import { NavBar } from "@/components/navbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/app-sidebar";

export default async function RetroLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SidebarProvider defaultOpen={false}>
        <SidebarInset>
          <NavBar />
          <main className="w-full bg-neutral-50 h-full">{children}</main>
        </SidebarInset>
        <AppSidebar />
      </SidebarProvider>
    </>
  );
}
