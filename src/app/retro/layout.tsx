export default async function RetroLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="size-full h-screen bg-neutral-50 dark:bg-neutral-800">
      {children}
    </main>
  );
}
