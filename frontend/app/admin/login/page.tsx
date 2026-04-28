"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAdmin } from "@/lib/admin/api";
import { storeAdminSession } from "@/lib/admin/auth";

function getSafeNextPath() {
  if (typeof window === "undefined") {
    return "/admin";
  }

  const nextPath = new URLSearchParams(window.location.search).get("next");
  return nextPath?.startsWith("/admin") ? nextPath : "/admin";
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError("请输入管理员密码");
      return;
    }

    setLoading(true);

    try {
      const session = await loginAdmin(password);
      storeAdminSession(session, remember);
      router.replace(getSafeNextPath());
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "登录失败，请稍后重试";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center border-b border-border px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-foreground">
            <span className="text-[11px] font-medium text-background">K</span>
          </div>
          <span className="text-sm font-medium tracking-tight">Kami 管理后台</span>
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col gap-1.5">
            <h1 className="text-xl font-medium tracking-tight">登录</h1>
            <p className="text-sm text-muted-foreground">使用管理员账户登录以继续。</p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username" className="text-xs font-normal text-muted-foreground">
                用户名
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                placeholder="kami"
                className="h-9"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-normal text-muted-foreground">
                  密码
                </Label>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  忘记密码？
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(value) => setRemember(Boolean(value))}
              />
              <Label
                htmlFor="remember"
                className="cursor-pointer text-sm font-normal text-muted-foreground"
              >
                保持登录状态
              </Label>
            </div>

            {error ? (
              <div
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </div>
            ) : null}

            <Button type="submit" disabled={loading} className="mt-1 h-9">
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  登录中
                </>
              ) : (
                "登录"
              )}
            </Button>
          </form>

          <div className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
            Kami v2 · 仅限管理员访问
          </div>
        </div>
      </div>
    </div>
  );
}
