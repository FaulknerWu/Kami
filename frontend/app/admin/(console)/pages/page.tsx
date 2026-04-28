"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Eye,
  EyeOff,
  FilePlus2,
  Inbox,
  MoreHorizontal,
  Search,
  Trash2,
} from "lucide-react";
import { AdminErrorState, AdminLoadingState } from "@/components/admin/feedback";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  deleteAdminPage,
  listAdminPages,
  publishAdminPage,
  unpublishAdminPage,
} from "@/lib/admin/api";
import { toPageListItemViewModel } from "@/lib/admin/adapters";
import type {
  AdminContentStatus,
  AdminPageListItemViewModel,
} from "@/lib/admin/types";

export default function PagesListPage() {
  const [pages, setPages] = useState<AdminPageListItemViewModel[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadPages = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActionError(null);

    try {
      const response = await listAdminPages();
      setPages(response.items.map(toPageListItemViewModel));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "无法加载页面列表");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPages();
  }, [loadPages]);

  const filtered = useMemo(
    () =>
      pages.filter((page) =>
        query
          ? `${page.title} ${page.slug}`.toLowerCase().includes(query.toLowerCase())
          : true,
      ),
    [pages, query],
  );

  async function changeStatus(id: string, status: AdminContentStatus) {
    setActionError(null);

    try {
      const updatedPage =
        status === "published" ? await publishAdminPage(id) : await unpublishAdminPage(id);
      const viewModel = toPageListItemViewModel(updatedPage);
      setPages((current) => current.map((page) => (page.id === id ? viewModel : page)));
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : "状态更新失败");
    }
  }

  async function remove(id: string) {
    if (!confirm("确认删除这个页面？此操作不可撤销。")) {
      return;
    }

    setActionError(null);

    try {
      await deleteAdminPage(id);
      setPages((current) => current.filter((page) => page.id !== id));
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : "删除失败");
    }
  }

  if (loading) {
    return <AdminLoadingState label="正在加载页面" />;
  }

  if (error) {
    return <AdminErrorState message={error} onRetry={loadPages} />;
  }

  return (
    <>
      <PageHeader
        title="页面"
        description="独立页面用于关于、友链、归档等长期存在的内容。"
        actions={
          <Button asChild className="h-8">
            <Link href="/admin/pages/new">
              <FilePlus2 className="h-3.5 w-3.5" />
              新建页面
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex items-center justify-between">
        <div className="relative">
          <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索页面"
            className="h-8 w-64 pl-8 text-sm"
          />
        </div>
        <span className="text-xs text-muted-foreground">共 {filtered.length} 个</span>
      </div>

      {actionError ? (
        <div
          role="alert"
          className="mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {actionError}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-md border border-border">
        <div className="hidden h-10 grid-cols-[1fr_180px_90px_140px_40px] items-center gap-4 border-b border-border bg-muted/40 px-4 text-xs text-muted-foreground md:grid">
          <div>标题</div>
          <div>路径</div>
          <div>状态</div>
          <div>更新时间</div>
          <div />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground">
              <Inbox className="h-4 w-4" />
            </div>
            <div className="text-sm font-medium">还没有页面</div>
            <div className="text-xs text-muted-foreground">创建关于页、友链页等长期内容。</div>
            <Button asChild variant="outline" size="sm" className="mt-2 h-8">
              <Link href="/admin/pages/new">新建页面</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((page) => (
              <li
                key={page.id}
                className="grid grid-cols-[1fr] items-center gap-4 px-4 py-3 transition-colors hover:bg-accent/30 md:h-14 md:grid-cols-[1fr_180px_90px_140px_40px]"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <Link
                    href={`/admin/pages/${page.id}`}
                    className="truncate text-sm font-medium underline-offset-2 hover:underline"
                  >
                    {page.title}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground md:hidden">
                    <StatusBadge status={page.status} />
                    <span className="font-mono">/{page.slug}</span>
                  </div>
                </div>
                <div className="hidden truncate font-mono text-xs text-muted-foreground md:block">
                  /{page.slug}
                </div>
                <div className="hidden md:block">
                  <StatusBadge status={page.status} />
                </div>
                <div className="hidden text-xs tabular-nums text-muted-foreground md:block">
                  {page.updatedAtLabel}
                </div>
                <div className="hidden justify-end md:flex">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        aria-label="更多操作"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/pages/${page.id}`}>编辑</Link>
                      </DropdownMenuItem>
                      {page.status === "published" ? (
                        <DropdownMenuItem onClick={() => void changeStatus(page.id, "draft")}>
                          <EyeOff className="h-3.5 w-3.5" />
                          取消发布
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => void changeStatus(page.id, "published")}>
                          <Eye className="h-3.5 w-3.5" />
                          发布
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <a href={`/${page.slug}`} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                          查看
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => void remove(page.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
