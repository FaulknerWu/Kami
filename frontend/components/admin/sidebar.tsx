"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AtSign,
  FileText,
  FileType2,
  Folder,
  LayoutDashboard,
  LogOut,
  Settings,
  Tag,
} from "lucide-react";
import { clearAdminSession } from "@/lib/admin/auth";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const mainNav: NavItem[] = [
  { label: "概览", href: "/admin", icon: LayoutDashboard },
  { label: "文章", href: "/admin/posts", icon: FileText },
  { label: "页面", href: "/admin/pages", icon: FileType2 },
  { label: "分类", href: "/admin/categories", icon: Folder },
  { label: "标签", href: "/admin/tags", icon: Tag },
];

const settingsNav: NavItem[] = [
  { label: "站点设置", href: "/admin/settings", icon: Settings },
  { label: "联系方式", href: "/admin/contacts", icon: AtSign },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex h-8 items-center gap-2.5 rounded-md px-3 text-sm transition-colors",
        active
          ? "bg-accent font-medium text-foreground"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  function logout() {
    clearAdminSession();
    router.push("/admin/login");
  }

  return (
    <aside className="hidden shrink-0 flex-col border-r border-border bg-sidebar md:flex md:w-60 lg:w-64">
      <div className="flex h-14 items-center border-b border-border px-5">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-foreground">
            <span className="text-[11px] font-medium tracking-tight text-background">K</span>
          </div>
          <span className="text-sm font-medium tracking-tight">Kami 管理后台</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
        <div className="flex flex-col gap-0.5">
          <div className="mb-1 px-3 text-[11px] uppercase tracking-wider text-muted-foreground/80">
            内容
          </div>
          {mainNav.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="mb-1 px-3 text-[11px] uppercase tracking-wider text-muted-foreground/80">
            设置
          </div>
          {settingsNav.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </div>
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
            K
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">Kami</div>
            <div className="truncate text-xs text-muted-foreground">Admin</div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="退出登录"
            title="退出登录"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
