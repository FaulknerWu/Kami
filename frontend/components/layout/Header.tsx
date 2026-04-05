'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MockFeatureButton } from "@/components/layout/MockFeatureButton";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerClasses = isHome
    ? `fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-zinc-800/50 bg-zinc-900/40 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`
    : "sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/60 backdrop-blur-md";

  const textClasses = isHome
    ? "text-white/80 hover:text-white"
    : "text-zinc-500 hover:text-zinc-900";

  const activeTextClasses = isHome ? "text-white" : "text-zinc-900";

  return (
    <header className={headerClasses}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-8">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${pathname === "/" ? activeTextClasses : textClasses}`}
          >
            首页
          </Link>
          <Link
            href="/archive"
            className={`text-sm font-medium transition-colors ${pathname === "/archive" ? activeTextClasses : textClasses}`}
          >
            归档
          </Link>
        </nav>
        <MockFeatureButton
          feature="search"
          className={`text-sm font-medium transition-colors ${textClasses}`}
        >
          搜索
        </MockFeatureButton>
      </div>
    </header>
  );
}
