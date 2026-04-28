"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { readAdminSession } from "@/lib/admin/auth";

export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const session = readAdminSession();

    if (!session) {
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    const readyTimer = window.setTimeout(() => setIsReady(true), 0);
    return () => window.clearTimeout(readyTimer);
  }, [pathname, router]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        正在验证登录状态
      </div>
    );
  }

  return <>{children}</>;
}
