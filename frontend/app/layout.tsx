import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/layout/SiteChrome";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "克制与留白 - 个人技术博客",
  description: "一个极简、专业、注重阅读体验的个人技术博客前端。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} h-full antialiased`}>
      <body
        className="flex min-h-screen flex-col bg-white font-sans text-zinc-900 antialiased selection:bg-zinc-200 selection:text-zinc-900"
        suppressHydrationWarning
      >
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
