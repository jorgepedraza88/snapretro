import type { Metadata } from "next";
import localFont from "next/font/local";
import { UserSessionContextProvider } from "@/hooks/user-session-context";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "OpenRetros",
  description: "OpenRetros is a tool for running retrospectives",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased max-h-screen lg:overflow-hidden`}
      >
        <UserSessionContextProvider>{children}</UserSessionContextProvider>
        <Toaster />
      </body>
    </html>
  );
}
