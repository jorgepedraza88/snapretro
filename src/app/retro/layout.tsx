import { NavBar } from "@/components/NavBar";

export default async function RetroLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="size-full h-screen bg-neutral-50 dark:bg-neutral-800">
      <NavBar />
      {children}
    </main>
  );
}
