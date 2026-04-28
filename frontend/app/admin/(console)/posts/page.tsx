"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Eye,
  EyeOff,
  Inbox,
  MoreHorizontal,
  PenLine,
  Search,
  Trash2,
} from "lucide-react";
import { AdminErrorState, AdminLoadingState } from "@/components/admin/feedback";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deleteAdminPost,
  listAdminCategories,
  listAdminPosts,
  publishAdminPost,
  unpublishAdminPost,
} from "@/lib/admin/api";
import {
  toCategoryViewModel,
  toPostListItemViewModel,
} from "@/lib/admin/adapters";
import type {
  AdminCategoryViewModel,
  AdminContentStatus,
  AdminPostListItemViewModel,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type Filter = "all" | AdminContentStatus;

export default function PostsPage() {
  const [posts, setPosts] = useState<AdminPostListItemViewModel[]>([]);
  const [categories, setCategories] = useState<AdminCategoryViewModel[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActionError(null);

    try {
      const [postsResponse, categoriesResponse] = await Promise.all([
        listAdminPosts(),
        listAdminCategories(),
      ]);

      setPosts(postsResponse.items.map(toPostListItemViewModel));
      setCategories(categoriesResponse.map((item) => toCategoryViewModel(item)));
      setSelected([]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "无法加载文章列表");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const counts = useMemo(
    () => ({
      all: posts.length,
      published: posts.filter((post) => post.status === "published").length,
      draft: posts.filter((post) => post.status === "draft").length,
    }),
    [posts],
  );

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      if (filter !== "all" && post.status !== filter) {
        return false;
      }

      if (category !== "all" && post.categoryId !== category) {
        return false;
      }

      if (
        query &&
        !`${post.title} ${post.summary} ${post.slug}`.toLowerCase().includes(query.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [posts, filter, category, query]);

  const allSelected =
    filtered.length > 0 && filtered.every((post) => selected.includes(post.id));

  function toggleAll() {
    if (allSelected) {
      setSelected([]);
      return;
    }

    setSelected(filtered.map((post) => post.id));
  }

  function toggleOne(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function changeStatus(id: string, status: AdminContentStatus) {
    setActionError(null);

    try {
      const updatedPost =
        status === "published" ? await publishAdminPost(id) : await unpublishAdminPost(id);
      const viewModel = toPostListItemViewModel(updatedPost);
      setPosts((current) => current.map((post) => (post.id === id ? viewModel : post)));
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : "状态更新失败");
    }
  }

  async function removePost(id: string) {
    if (!confirm("确认删除这篇文章？此操作不可撤销。")) {
      return;
    }

    setActionError(null);

    try {
      await deleteAdminPost(id);
      setPosts((current) => current.filter((post) => post.id !== id));
      setSelected((current) => current.filter((item) => item !== id));
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : "删除失败");
    }
  }

  async function bulkAction(action: "publish" | "unpublish" | "delete") {
    if (selected.length === 0) {
      return;
    }

    setActionError(null);

    try {
      if (action === "delete") {
        if (!confirm(`确认删除选中的 ${selected.length} 篇文章？`)) {
          return;
        }

        await Promise.all(selected.map((id) => deleteAdminPost(id)));
        setPosts((current) => current.filter((post) => !selected.includes(post.id)));
        setSelected([]);
        return;
      }

      const updatedPosts = await Promise.all(
        selected.map((id) =>
          action === "publish" ? publishAdminPost(id) : unpublishAdminPost(id),
        ),
      );
      const updatedPostMap = new Map(
        updatedPosts.map((post) => {
          const viewModel = toPostListItemViewModel(post);
          return [viewModel.id, viewModel] as const;
        }),
      );

      setPosts((current) =>
        current.map((post) => updatedPostMap.get(post.id) ?? post),
      );
      setSelected([]);
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : "批量操作失败");
    }
  }

  if (loading) {
    return <AdminLoadingState label="正在加载文章" />;
  }

  if (error) {
    return <AdminErrorState message={error} onRetry={loadPosts} />;
  }

  return (
    <>
      <PageHeader
        title="文章"
        description="管理博客文章。支持按状态、分类筛选与批量操作。"
        actions={
          <Button asChild className="h-8">
            <Link href="/admin/posts/new">
              <PenLine className="h-3.5 w-3.5" />
              新建文章
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="-mb-px flex items-center gap-1 border-b border-border">
          {(
            [
              ["all", "全部", counts.all],
              ["published", "已发布", counts.published],
              ["draft", "草稿", counts.draft],
            ] as const
          ).map(([value, label, count]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={cn(
                "-mb-px flex h-9 items-center gap-2 border-b-2 px-3 text-sm transition-colors",
                filter === value
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
              <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-8 w-36 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {categories.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索标题、摘要或 slug"
              className="h-8 w-56 pl-8 text-sm"
            />
          </div>
        </div>
      </div>

      {actionError ? (
        <div
          role="alert"
          className="mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {actionError}
        </div>
      ) : null}

      {selected.length > 0 ? (
        <div className="mb-3 flex h-10 items-center gap-3 rounded-md border border-border bg-muted/60 px-3 text-sm">
          <span className="text-muted-foreground">已选 {selected.length} 项</span>
          <div className="h-4 w-px bg-border" />
          <button
            type="button"
            onClick={() => void bulkAction("publish")}
            className="text-foreground underline-offset-2 hover:underline"
          >
            发布
          </button>
          <button
            type="button"
            onClick={() => void bulkAction("unpublish")}
            className="text-foreground underline-offset-2 hover:underline"
          >
            取消发布
          </button>
          <button
            type="button"
            onClick={() => void bulkAction("delete")}
            className="text-destructive underline-offset-2 hover:underline"
          >
            删除
          </button>
          <button
            type="button"
            onClick={() => setSelected([])}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            取消选择
          </button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-md border border-border">
        <div className="hidden h-10 grid-cols-[36px_1fr_140px_180px_90px_140px_40px] items-center gap-4 border-b border-border bg-muted/40 px-4 text-xs text-muted-foreground md:grid">
          <div className="flex items-center">
            <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="全选" />
          </div>
          <div>标题</div>
          <div>分类</div>
          <div>标签</div>
          <div>状态</div>
          <div>更新时间</div>
          <div />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground">
              <Inbox className="h-4 w-4" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium">没有匹配的文章</div>
              <div className="text-xs text-muted-foreground">
                尝试调整筛选条件，或新建一篇文章。
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="mt-2 h-8">
              <Link href="/admin/posts/new">新建文章</Link>
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((post) => {
              const checked = selected.includes(post.id);

              return (
                <li
                  key={post.id}
                  className={cn(
                    "grid grid-cols-[36px_1fr] items-center gap-4 px-4 py-3 transition-colors hover:bg-accent/30 md:h-14 md:grid-cols-[36px_1fr_140px_180px_90px_140px_40px]",
                    checked && "bg-accent/40",
                  )}
                >
                  <div className="flex items-center">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleOne(post.id)}
                      aria-label={`选择 ${post.title}`}
                    />
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="truncate text-sm font-medium underline-offset-2 hover:underline"
                    >
                      {post.title}
                    </Link>
                    <div className="truncate font-mono text-xs text-muted-foreground">
                      /{post.slug}
                    </div>
                    <div className="mt-1 flex items-center gap-2 md:hidden">
                      <StatusBadge status={post.status} />
                      <span className="text-xs text-muted-foreground">{post.categoryName}</span>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {post.updatedAtLabel}
                      </span>
                    </div>
                  </div>
                  <div className="hidden truncate text-sm text-muted-foreground md:block">
                    {post.categoryName}
                  </div>
                  <div className="hidden min-w-0 flex-wrap items-center gap-1 md:flex">
                    {post.tags.length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex h-5 items-center rounded-sm border border-border px-1.5 text-[11px] text-muted-foreground"
                        >
                          {tag.name}
                        </span>
                      ))
                    )}
                    {post.tags.length > 3 ? (
                      <span className="text-[11px] text-muted-foreground">
                        +{post.tags.length - 3}
                      </span>
                    ) : null}
                  </div>
                  <div className="hidden md:block">
                    <StatusBadge status={post.status} />
                  </div>
                  <div className="hidden text-xs tabular-nums text-muted-foreground md:block">
                    {post.updatedAtLabel}
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
                          <Link href={`/admin/posts/${post.id}`}>
                            <PenLine className="h-3.5 w-3.5" />
                            编辑
                          </Link>
                        </DropdownMenuItem>
                        {post.status === "published" ? (
                          <DropdownMenuItem onClick={() => void changeStatus(post.id, "draft")}>
                            <EyeOff className="h-3.5 w-3.5" />
                            取消发布
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => void changeStatus(post.id, "published")}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            发布
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                          <a href={`/posts/${post.slug}`} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                            查看
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => void removePost(post.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>共 {filtered.length} 篇</span>
        <span className="tabular-nums">第 1 / 1 页</span>
      </div>
    </>
  );
}
