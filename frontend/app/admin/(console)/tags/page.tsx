"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { AdminErrorState, AdminLoadingState } from "@/components/admin/feedback";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createAdminTag,
  deleteAdminTag,
  listAdminTags,
  updateAdminTag,
} from "@/lib/admin/api";
import { toTagViewModel } from "@/lib/admin/adapters";
import type { AdminTagViewModel } from "@/lib/admin/types";

export default function TagsPage() {
  const [items, setItems] = useState<AdminTagViewModel[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActionError(null);

    try {
      const response = await listAdminTags();
      setItems(response.map((tag) => toTagViewModel(tag)));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "无法加载标签");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTags();
  }, [loadTags]);

  const filtered = useMemo(
    () =>
      items.filter((tag) =>
        query ? `${tag.name} ${tag.slug}`.toLowerCase().includes(query.toLowerCase()) : true,
      ),
    [items, query],
  );

  function reset() {
    setEditingId(null);
    setName("");
    setSlug("");
    setActionError(null);
  }

  function startEdit(tag: AdminTagViewModel) {
    setEditingId(tag.id);
    setName(tag.name);
    setSlug(tag.slug);
    setActionError(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim() || !slug.trim()) {
      setActionError("请填写标签名称和 Slug");
      return;
    }

    const currentItem = editingId ? items.find((tag) => tag.id === editingId) : null;
    setActionError(null);

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
      };
      const savedTag = editingId
        ? await updateAdminTag(editingId, payload)
        : await createAdminTag(payload);
      const viewModel = toTagViewModel(savedTag, currentItem?.count ?? 0);

      setItems((current) =>
        editingId
          ? current.map((tag) => (tag.id === editingId ? viewModel : tag))
          : [...current, viewModel],
      );
      reset();
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : "保存标签失败");
    }
  }

  async function remove(id: string) {
    if (!confirm("确认删除该标签？文章将解除该标签的关联。")) {
      return;
    }

    setActionError(null);

    try {
      await deleteAdminTag(id);
      setItems((current) => current.filter((tag) => tag.id !== id));
      if (editingId === id) {
        reset();
      }
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : "删除标签失败");
    }
  }

  if (loading) {
    return <AdminLoadingState label="正在加载标签" />;
  }

  if (error) {
    return <AdminErrorState message={error} onRetry={loadTags} />;
  }

  return (
    <>
      <PageHeader title="标签" description="标签用于跨分类的横向标记，每篇文章可以有多个标签。" />

      {actionError ? (
        <div
          role="alert"
          className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {actionError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
        <section className="flex flex-col gap-3">
          <div className="text-sm font-medium">{editingId ? "编辑标签" : "新增标签"}</div>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-normal text-muted-foreground">名称</Label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="TypeScript"
                className="h-8"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-normal text-muted-foreground">Slug</Label>
              <Input
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="typescript"
                className="h-8 font-mono text-sm"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button type="submit" size="sm" className="h-8">
                {editingId ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    保存
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    添加
                  </>
                )}
              </Button>
              {editingId ? (
                <Button type="button" variant="outline" size="sm" className="h-8" onClick={reset}>
                  <X className="h-3.5 w-3.5" />
                  取消
                </Button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索标签"
                className="h-8 w-56 pl-8 text-sm"
              />
            </div>
            <span className="text-xs text-muted-foreground">共 {filtered.length} 个</span>
          </div>

          <div className="overflow-hidden rounded-md border border-border">
            <div className="hidden h-10 grid-cols-[1fr_160px_80px_100px] items-center gap-4 border-b border-border bg-muted/40 px-4 text-xs text-muted-foreground md:grid">
              <div>名称</div>
              <div>Slug</div>
              <div className="tabular-nums">文章数</div>
              <div className="text-right">操作</div>
            </div>
            <ul className="divide-y divide-border">
              {filtered.map((tag) => (
                <li
                  key={tag.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-2.5 md:grid-cols-[1fr_160px_80px_100px]"
                >
                  <span className="text-sm font-medium">{tag.name}</span>
                  <span className="hidden font-mono text-xs text-muted-foreground md:block">
                    {tag.slug}
                  </span>
                  <span className="hidden text-sm tabular-nums text-muted-foreground md:block">
                    {tag.count}
                  </span>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => startEdit(tag)}
                      aria-label={`编辑 ${tag.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => void remove(tag.id)}
                      aria-label={`删除 ${tag.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
