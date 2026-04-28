"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { label: "概览", href: "/admin" },
  { label: "文章", href: "/admin/posts" },
  { label: "页面", href: "/admin/pages" },
  { label: "分类", href: "/admin/categories" },
  { label: "标签", href: "/admin/tags" },
  { label: "站点设置", href: "/admin/settings" },
  { label: "联系方式", href: "/admin/contacts" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-foreground">
            <span className="text-[11px] font-medium text-background">K</span>
          </div>
          <span className="text-sm font-medium tracking-tight">Kami 管理后台</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-accent"
          aria-label={open ? "关闭菜单" : "打开菜单"}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </header>

      {open ? (
        <div className="border-b border-border bg-background md:hidden">
          <nav className="flex flex-col py-2">
            {nav.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex h-10 items-center px-5 text-sm transition-colors",
                    active
                      ? "bg-accent/60 font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </>
  );
}
