import { NavBar } from "@/components/navbar";
import { SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/app-sidebar";

export default async function RetroLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavBar />
      <SidebarProvider defaultOpen={false}>
        <main className="w-full">{children}</main>
        <AppSidebar />
      </SidebarProvider>
    </>
  );
}
