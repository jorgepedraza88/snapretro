import { NavBar } from "@/components/navbar";
import { SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/app-sidebar";
import { Footer } from "@/components/footer";

export default function RetroLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <NavBar />
      <SidebarProvider defaultOpen={false}>
        <main className="w-full">{children}</main>
        <AppSidebar />
        <Footer />
      </SidebarProvider>
    </div>
  );
}
