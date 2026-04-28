import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Kami 管理后台",
  description: "Kami 博客系统管理后台",
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section
      className={`${geist.variable} ${geistMono.variable} admin-shell min-h-screen w-full bg-background font-sans text-foreground antialiased`}
    >
      {children}
    </section>
  );
}
