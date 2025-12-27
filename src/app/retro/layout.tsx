import QueryProvider from '@/providers/QueryProvider';

export default function RetroLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryProvider>
      <main className="size-full h-screen bg-neutral-50 dark:bg-neutral-800">{children}</main>
    </QueryProvider>
  );
}
