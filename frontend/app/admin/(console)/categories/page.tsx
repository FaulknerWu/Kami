"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { AdminErrorState, AdminLoadingState } from "@/components/admin/feedback";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createAdminCategory,
  deleteAdminCategory,
  listAdminCategories,
  updateAdminCategory,
} from "@/lib/admin/api";
import { toCategoryViewModel } from "@/lib/admin/adapters";
import type { AdminCategoryViewModel } from "@/lib/admin/types";

export default function CategoriesPage() {
  const [items, setItems] = useState<AdminCategoryViewModel[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActionError(null);

    try {
      const response = await listAdminCategories();
      setItems(response.map((category) => toCategoryViewModel(category)));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "无法加载分类");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  function reset() {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setActionError(null);
  }

  function startEdit(category: AdminCategoryViewModel) {
    setEditingId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description);
    setActionError(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim() || !slug.trim()) {
      setActionError("请填写分类名称和 Slug");
      return;
    }

    const currentItem = editingId
      ? items.find((category) => category.id === editingId)
      : null;
    const nextSortOrder =
      currentItem?.sortOrder ?? Math.max(0, ...items.map((category) => category.sortOrder)) + 1;

    setActionError(null);

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        sortOrder: nextSortOrder,
      };

      const savedCategory = editingId
        ? await updateAdminCategory(editingId, payload)
        : await createAdminCategory(payload);
      const viewModel = toCategoryViewModel(savedCategory, currentItem?.count ?? 0);

      setItems((current) =>
        editingId
          ? current.map((category) => (category.id === editingId ? viewModel : category))
          : [...current, viewModel],
      );
      reset();
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : "保存分类失败");
    }
  }

  async function remove(id: string) {
    if (!confirm("确认删除该分类？属于该分类的文章将不再有分类。")) {
      return;
    }

    setActionError(null);

    try {
      await deleteAdminCategory(id);
      setItems((current) => current.filter((category) => category.id !== id));
      if (editingId === id) {
        reset();
      }
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : "删除分类失败");
    }
  }

  if (loading) {
    return <AdminLoadingState label="正在加载分类" />;
  }

  if (error) {
    return <AdminErrorState message={error} onRetry={loadCategories} />;
  }

  return (
    <>
      <PageHeader
        title="分类"
        description="将相近主题的文章组织到同一分类下。每篇文章仅属于一个分类。"
      />

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
          <div className="text-sm font-medium">{editingId ? "编辑分类" : "新增分类"}</div>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-normal text-muted-foreground">名称</Label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="技术"
                className="h-8"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-normal text-muted-foreground">Slug</Label>
              <Input
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="tech"
                className="h-8 font-mono text-sm"
              />
              <span className="text-xs text-muted-foreground">仅使用小写字母、数字与连字符。</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-normal text-muted-foreground">描述</Label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="可选，将显示在分类页面顶部。"
                className="min-h-[80px] resize-none text-sm"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button type="submit" size="sm" className="h-8">
                {editingId ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    保存修改
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    添加分类
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

        <section className="overflow-hidden rounded-md border border-border">
          <div className="hidden h-10 grid-cols-[1fr_140px_80px_100px] items-center gap-4 border-b border-border bg-muted/40 px-4 text-xs text-muted-foreground md:grid">
            <div>名称 / 描述</div>
            <div>Slug</div>
            <div className="tabular-nums">文章数</div>
            <div className="text-right">操作</div>
          </div>
          <ul className="divide-y divide-border">
            {items.map((category) => (
              <li
                key={category.id}
                className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 md:grid-cols-[1fr_140px_80px_100px]"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-medium">{category.name}</span>
                  {category.description ? (
                    <span className="truncate text-xs text-muted-foreground">
                      {category.description}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/60">无描述</span>
                  )}
                </div>
                <div className="hidden font-mono text-xs text-muted-foreground md:block">
                  {category.slug}
                </div>
                <div className="hidden text-sm tabular-nums text-muted-foreground md:block">
                  {category.count}
                </div>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => startEdit(category)}
                    aria-label={`编辑 ${category.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => void remove(category.id)}
                    aria-label={`删除 ${category.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
