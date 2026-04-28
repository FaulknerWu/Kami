"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  Eye,
  ImagePlus,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  AdminArticleMutationInput,
  AdminCategoryViewModel,
  AdminContentStatus,
  AdminEditorInitialViewModel,
  AdminPageMutationInput,
  AdminTagViewModel,
} from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type EditorMode = "post" | "page";

type SaveInput = AdminArticleMutationInput | AdminPageMutationInput;

interface SaveResult {
  status?: AdminContentStatus;
}

interface PostEditorProps {
  mode?: EditorMode;
  initial?: Partial<AdminEditorInitialViewModel>;
  categories?: AdminCategoryViewModel[];
  tags?: AdminTagViewModel[];
  isNew?: boolean;
  onSave: (input: SaveInput, status: AdminContentStatus) => Promise<SaveResult | void>;
  onDelete?: () => Promise<void>;
}

export function PostEditor({
  mode = "post",
  initial,
  categories = [],
  tags = [],
  isNew = false,
  onSave,
  onDelete,
}: PostEditorProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [cover, setCover] = useState(initial?.cover ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [status, setStatus] = useState<AdminContentStatus>(initial?.status ?? "draft");
  const [category, setCategory] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [selectedTags, setSelectedTags] = useState<string[]>(initial?.tagIds ?? []);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");

  useEffect(() => {
    setTitle(initial?.title ?? "");
    setSlug(initial?.slug ?? "");
    setSummary(initial?.summary ?? "");
    setCover(initial?.cover ?? "");
    setContent(initial?.content ?? "");
    setStatus(initial?.status ?? "draft");
    setCategory(initial?.categoryId ?? categories[0]?.id ?? "");
    setSelectedTags(initial?.tagIds ?? []);
  }, [
    categories,
    initial?.categoryId,
    initial?.content,
    initial?.cover,
    initial?.id,
    initial?.slug,
    initial?.status,
    initial?.summary,
    initial?.tagIds,
    initial?.title,
  ]);

  function toggleTag(id: string) {
    setSelectedTags((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function validate(nextStatus: AdminContentStatus) {
    if (!title.trim() || !slug.trim()) {
      return "请填写标题和 Slug";
    }

    if (mode === "post" && !summary.trim()) {
      return "请填写文章摘要";
    }

    if (mode === "post" && !content.trim() && nextStatus === "published") {
      return "发布前请填写文章内容";
    }

    return null;
  }

  async function save(nextStatus: AdminContentStatus) {
    const validationError = validate(nextStatus);

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    setStatus(nextStatus);

    try {
      const input =
        mode === "post"
          ? {
              title,
              slug,
              summary,
              content,
              cover,
              categoryId: category,
              tagIds: selectedTags,
            }
          : {
              title,
              slug,
              summary,
              content,
              cover,
            };
      const result = await onSave(input, nextStatus);
      const now = new Date();

      if (result?.status) {
        setStatus(result.status);
      }

      setSavedAt(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`,
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!onDelete || !confirm("确认删除？此操作不可撤销。")) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onDelete();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "删除失败");
      setSaving(false);
    }
  }

  const backHref = mode === "post" ? "/admin/posts" : "/admin/pages";
  const titlePlaceholder = mode === "post" ? "无标题文章" : "无标题页面";
  const publicHref = mode === "post" ? `/posts/${slug}` : `/${slug}`;

  return (
    <div className="-mt-2">
      <div className="mb-6 flex items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            返回
          </Link>
          <div className="h-4 w-px bg-border" />
          <span className="truncate text-sm text-muted-foreground">
            {isNew ? `新建${mode === "post" ? "文章" : "页面"}` : `编辑${mode === "post" ? "文章" : "页面"}`}
          </span>
          {savedAt ? (
            <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
              <Check className="h-3 w-3" />
              已保存于 {savedAt}
            </span>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => void save("draft")}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            保存草稿
          </Button>
          <Button
            size="sm"
            className="h-8"
            onClick={() => void save("published")}
            disabled={saving}
          >
            {status === "published" ? "更新发布" : "发布"}
          </Button>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={titlePlaceholder}
              className="h-auto border-0 px-0 py-2 text-2xl font-medium tracking-tight shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="shrink-0 font-mono text-xs text-muted-foreground">/</span>
            <Input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="article-slug"
              className="h-8 font-mono text-sm"
            />
          </div>

          {mode === "post" ? (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-normal text-muted-foreground">摘要</Label>
              <Textarea
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="一段简短的描述，用于列表与分享卡片。"
                className="min-h-[72px] resize-none text-sm"
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-border">
              <div className="-mb-px flex items-center">
                {(
                  [
                    ["write", "编辑"],
                    ["preview", "预览"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTab(value)}
                    className={cn(
                      "-mb-px h-9 border-b-2 px-3 text-sm transition-colors",
                      tab === value
                        ? "border-foreground font-medium text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="text-xs tabular-nums text-muted-foreground">
                {content.length} 字符
              </div>
            </div>

            {tab === "write" ? (
              <Textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="使用 Markdown 撰写内容…"
                className="min-h-[480px] resize-y font-mono text-sm leading-relaxed"
              />
            ) : (
              <div className="min-h-[480px] rounded-md border border-border bg-background p-6">
                {content.trim() ? (
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                    {content}
                  </pre>
                ) : (
                  <p className="text-sm text-muted-foreground">暂无内容可预览。</p>
                )}
              </div>
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-6 self-start lg:sticky lg:top-6">
          <SidebarSection title="发布">
            <div className="flex flex-col gap-3 text-sm">
              <Row label="状态">
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as AdminContentStatus)}
                >
                  <SelectTrigger className="h-8 w-32 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="published">已发布</SelectItem>
                  </SelectContent>
                </Select>
              </Row>
              <Row label="可见性">
                <span className="text-muted-foreground">公开</span>
              </Row>
              {!isNew && initial?.publishedAt ? (
                <Row label="发布时间">
                  <span className="text-muted-foreground tabular-nums">
                    {initial.publishedAt.replace("T", " ").slice(0, 16)}
                  </span>
                </Row>
              ) : null}
            </div>
          </SidebarSection>

          {mode === "post" ? (
            <>
              <SidebarSection title="分类">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-8 w-full text-sm">
                    <SelectValue placeholder="未分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </SidebarSection>

              <SidebarSection title="标签">
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => {
                    const active = selectedTags.includes(tag.id);

                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={cn(
                          "h-6 rounded-sm border px-2 text-xs transition-colors",
                          active
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground",
                        )}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </SidebarSection>

              <SidebarSection title="封面">
                {cover ? (
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cover}
                      alt="封面预览"
                      className="aspect-[3/2] w-full rounded-md border border-border bg-muted object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCover("")}
                      className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-sm border border-border bg-background/90 text-muted-foreground hover:text-foreground"
                      aria-label="移除封面"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCover("/blog-cover.png")}
                    className="flex aspect-[3/2] w-full flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border text-muted-foreground transition-colors hover:border-muted-foreground hover:text-foreground"
                  >
                    <ImagePlus className="h-4 w-4" />
                    <span className="text-xs">添加封面</span>
                  </button>
                )}
                <Input
                  value={cover}
                  onChange={(event) => setCover(event.target.value)}
                  placeholder="或粘贴图片 URL"
                  className="mt-2 h-8 font-mono text-xs"
                />
              </SidebarSection>
            </>
          ) : null}

          {!isNew ? (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <a
                href={publicHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Eye className="h-3 w-3" />
                查看
              </a>
              {onDelete ? (
                <button
                  type="button"
                  onClick={() => void remove()}
                  disabled={saving}
                  className="inline-flex items-center gap-1 text-xs text-destructive underline-offset-2 hover:underline disabled:pointer-events-none disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                  删除
                </button>
              ) : null}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div>{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <div>{children}</div>
    </div>
  );
}
