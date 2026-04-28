import type { ReactNode } from "react";
import { AdminAuthGuard } from "@/components/admin/auth-guard";
import { AdminSidebar } from "@/components/admin/sidebar";
import { MobileNav } from "@/components/admin/mobile-nav";

export default function AdminConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen flex-col bg-background md:flex-row">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileNav />
          <main className="w-full max-w-[1180px] flex-1 px-5 py-6 md:px-8 md:py-8 lg:px-10">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
