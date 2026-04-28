"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, FilePlus2, PenLine } from "lucide-react";
import { AdminErrorState, AdminLoadingState } from "@/components/admin/feedback";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  listAdminCategories,
  listAdminPages,
  listAdminPosts,
  listAdminTags,
} from "@/lib/admin/api";
import {
  toCategoryViewModel,
  toPageListItemViewModel,
  toPostListItemViewModel,
  toTagViewModel,
} from "@/lib/admin/adapters";
import type {
  AdminCategoryViewModel,
  AdminPageListItemViewModel,
  AdminPostListItemViewModel,
  AdminTagViewModel,
} from "@/lib/admin/types";

interface DashboardData {
  posts: AdminPostListItemViewModel[];
  pages: AdminPageListItemViewModel[];
  categories: AdminCategoryViewModel[];
  tags: AdminTagViewModel[];
}

function StatItem({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-medium tracking-tight tabular-nums">{value}</div>
        {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [postsResponse, pagesResponse, categoriesResponse, tagsResponse] = await Promise.all([
        listAdminPosts(),
        listAdminPages(),
        listAdminCategories(),
        listAdminTags(),
      ]);

      setData({
        posts: postsResponse.items.map(toPostListItemViewModel),
        pages: pagesResponse.items.map(toPageListItemViewModel),
        categories: categoriesResponse.map((category) => toCategoryViewModel(category)),
        tags: tagsResponse.map((tag) => toTagViewModel(tag)),
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "无法加载后台概览");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const dashboard = useMemo(() => {
    if (!data) {
      return null;
    }

    const published = data.posts.filter((post) => post.status === "published");
    const drafts = data.posts.filter((post) => post.status === "draft");

    return {
      published,
      drafts,
      recent: data.posts.slice(0, 6),
      recentDrafts: drafts.slice(0, 4),
    };
  }, [data]);

  if (loading) {
    return <AdminLoadingState label="正在加载概览" />;
  }

  if (error || !data || !dashboard) {
    return <AdminErrorState message={error ?? "概览数据为空"} onRetry={loadDashboard} />;
  }

  return (
    <>
      <PageHeader
        title="概览"
        description="当前站点内容状态与最近的写作活动。"
        actions={
          <Button asChild className="h-8">
            <Link href="/admin/posts/new">
              <PenLine className="h-3.5 w-3.5" />
              撰写文章
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 divide-x divide-border border-y border-border md:grid-cols-5">
        <div className="px-4 first:pl-0">
          <StatItem label="已发布文章" value={dashboard.published.length} />
        </div>
        <div className="px-4">
          <StatItem label="草稿" value={dashboard.drafts.length} />
        </div>
        <div className="px-4">
          <StatItem label="页面" value={data.pages.length} />
        </div>
        <div className="px-4">
          <StatItem label="分类" value={data.categories.length} />
        </div>
        <div className="px-4 last:pr-0">
          <StatItem label="标签" value={data.tags.length} />
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <section className="flex flex-col lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium">最近编辑</h2>
            <Link
              href="/admin/posts"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              查看全部
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border rounded-md border border-border">
            {dashboard.recent.map((post) => (
              <Link
                key={post.id}
                href={`/admin/posts/${post.id}`}
                className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-accent/40"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm font-medium group-hover:text-foreground">
                      {post.title}
                    </span>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{post.summary}</div>
                </div>
                <div className="hidden shrink-0 items-center gap-3 sm:flex">
                  <StatusBadge status={post.status} />
                  <span className="w-32 text-right text-xs tabular-nums text-muted-foreground">
                    {post.updatedAtLabel}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-8">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium">未完成草稿</h2>
              <span className="text-xs tabular-nums text-muted-foreground">
                {dashboard.drafts.length}
              </span>
            </div>
            <div className="divide-y divide-border rounded-md border border-border">
              {dashboard.recentDrafts.length === 0 ? (
                <div className="px-4 py-6 text-sm text-muted-foreground">没有草稿。</div>
              ) : (
                dashboard.recentDrafts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/admin/posts/${post.id}`}
                    className="flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-accent/40"
                  >
                    <span className="truncate text-sm font-medium">{post.title}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {post.updatedAtLabel}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-medium">快速入口</h2>
            <div className="divide-y divide-border rounded-md border border-border text-sm">
              <Link
                href="/admin/posts/new"
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/40"
              >
                <PenLine className="h-4 w-4 text-muted-foreground" />
                新建文章
              </Link>
              <Link
                href="/admin/pages/new"
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/40"
              >
                <FilePlus2 className="h-4 w-4 text-muted-foreground" />
                新建页面
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/40"
              >
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                调整站点设置
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
