import { NavBar } from "@/components/navbar";

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <NavBar />
      <main>{children}</main>
    </div>
  );
}
