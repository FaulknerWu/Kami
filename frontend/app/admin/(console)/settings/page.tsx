"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { AdminErrorState, AdminLoadingState } from "@/components/admin/feedback";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAdminSiteProfile, updateAdminSiteProfile } from "@/lib/admin/api";
import {
  toSiteProfileMutationRequest,
  toSiteSettingsViewModel,
} from "@/lib/admin/adapters";
import type { AdminSiteSettingsViewModel } from "@/lib/admin/types";

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-sm font-medium">{title}</h2>
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 py-4 first:pt-0 last:pb-0 md:grid-cols-[180px_1fr] md:items-start md:gap-6">
      <div className="flex flex-col gap-0.5 md:pt-1.5">
        <Label className="text-sm font-normal">{label}</Label>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AdminSiteSettingsViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActionError(null);

    try {
      const response = await getAdminSiteProfile();
      setSettings(toSiteSettingsViewModel(response));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "无法加载站点设置");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  function update<K extends keyof AdminSiteSettingsViewModel>(
    key: K,
    value: AdminSiteSettingsViewModel[K],
  ) {
    setSettings((current) => (current ? { ...current, [key]: value } : current));
  }

  async function save() {
    if (!settings) {
      return;
    }

    if (!settings.siteName.trim() || !settings.authorName.trim()) {
      setActionError("请填写站点名称和作者名称");
      return;
    }

    setSaving(true);
    setActionError(null);

    try {
      const response = await updateAdminSiteProfile(toSiteProfileMutationRequest(settings));
      setSettings(toSiteSettingsViewModel(response));
      const now = new Date();
      setSavedAt(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      );
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : "保存站点设置失败");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <AdminLoadingState label="正在加载站点设置" />;
  }

  if (error || !settings) {
    return <AdminErrorState message={error ?? "站点设置为空"} onRetry={loadSettings} />;
  }

  return (
    <>
      <PageHeader
        title="站点设置"
        description="站点的基础信息、作者资料与分享配置。"
        actions={
          <div className="flex items-center gap-3">
            {savedAt ? (
              <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
                <Check className="h-3 w-3" />
                已保存于 {savedAt}
              </span>
            ) : null}
            <Button onClick={() => void save()} disabled={saving} size="sm" className="h-8">
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  保存中
                </>
              ) : (
                "保存设置"
              )}
            </Button>
          </div>
        }
      />

      {actionError ? (
        <div
          role="alert"
          className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {actionError}
        </div>
      ) : null}

      <div className="flex flex-col gap-10">
        <section className="flex flex-col gap-4">
          <SectionHeader title="基础信息" description="站点核心标识与对外展示文案。" />
          <div className="divide-y divide-border rounded-md border border-border px-5 py-2">
            <Field label="站点名称" hint="显示在标签页与导航处。">
              <Input
                value={settings.siteName}
                onChange={(event) => update("siteName", event.target.value)}
                className="h-9 max-w-md"
              />
            </Field>
            <Field label="首页标题" hint="用于浏览器标签与搜索引擎。">
              <Input
                value={settings.homeTitle}
                onChange={(event) => update("homeTitle", event.target.value)}
                className="h-9"
              />
            </Field>
            <Field label="副标题" hint="一句话描述站点。">
              <Input
                value={settings.subtitle}
                onChange={(event) => update("subtitle", event.target.value)}
                className="h-9"
              />
            </Field>
            <Field label="站点地址" hint="用于生成绝对链接、RSS 与 sitemap。">
              <Input
                value={settings.siteUrl}
                onChange={(event) => update("siteUrl", event.target.value)}
                className="h-9 max-w-md font-mono text-sm"
                placeholder="https://example.com"
              />
            </Field>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeader title="作者信息" description="出现在关于、文章末尾与分享卡片。" />
          <div className="divide-y divide-border rounded-md border border-border px-5 py-2">
            <Field label="作者名称">
              <Input
                value={settings.authorName}
                onChange={(event) => update("authorName", event.target.value)}
                className="h-9 max-w-md"
              />
            </Field>
            <Field label="作者简介" hint="一两句话即可，展示在站点底部。">
              <Textarea
                value={settings.authorBio}
                onChange={(event) => update("authorBio", event.target.value)}
                className="min-h-[88px] resize-none text-sm"
              />
            </Field>
            <Field label="头像">
              <div className="flex items-start gap-4">
                {settings.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.avatar}
                    alt="头像预览"
                    className="h-16 w-16 rounded-full border border-border bg-muted object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-border bg-muted text-muted-foreground">
                    <ImagePlus className="h-4 w-4" />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-2">
                  <Input
                    value={settings.avatar}
                    onChange={(event) => update("avatar", event.target.value)}
                    placeholder="/avatars/me.png 或图片 URL"
                    className="h-9 font-mono text-sm"
                  />
                  <span className="text-xs text-muted-foreground">推荐使用 1:1 比例的方形图片。</span>
                </div>
              </div>
            </Field>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeader title="视觉与分享" description="封面图与社交分享时的展示图。" />
          <div className="divide-y divide-border rounded-md border border-border px-5 py-2">
            <Field label="首页封面" hint="可选。展示在首页顶部。">
              <ImageField value={settings.cover} onChange={(value) => update("cover", value)} />
            </Field>
            <Field label="分享图" hint="用于 OpenGraph / Twitter Card，建议 1200×630。">
              <ImageField
                value={settings.shareImage}
                onChange={(value) => update("shareImage", value)}
              />
            </Field>
          </div>
        </section>

        <div className="flex items-center justify-end pt-2">
          <Button onClick={() => void save()} disabled={saving} className="h-9">
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                保存中
              </>
            ) : (
              "保存设置"
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

function ImageField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex max-w-xl flex-col gap-2">
      {value ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="预览"
            className="aspect-[1200/630] w-full rounded-md border border-border bg-muted object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-sm border border-border bg-background/90 text-muted-foreground hover:text-foreground"
            aria-label="移除图片"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onChange("/social-share-image.jpg")}
          className="flex aspect-[1200/630] w-full flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border text-muted-foreground transition-colors hover:border-muted-foreground hover:text-foreground"
        >
          <ImagePlus className="h-4 w-4" />
          <span className="text-xs">添加图片</span>
        </button>
      )}
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="或粘贴图片 URL"
        className="h-9 font-mono text-xs"
      />
    </div>
  );
}
