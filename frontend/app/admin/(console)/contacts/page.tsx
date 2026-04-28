"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { AdminErrorState, AdminLoadingState } from "@/components/admin/feedback";
import { PageHeader } from "@/components/admin/page-header";
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
import { Switch } from "@/components/ui/switch";
import { listAdminContacts, updateAdminContacts } from "@/lib/admin/api";
import {
  toContactMethodViewModel,
  toSiteContactsMutationRequest,
} from "@/lib/admin/adapters";
import type {
  AdminContactMethodViewModel,
  AdminContactType,
} from "@/lib/admin/types";

const typeLabels: Record<AdminContactType, string> = {
  email: "邮箱",
  github: "GitHub",
  twitter: "Twitter",
  telegram: "Telegram",
  rss: "RSS",
  custom: "自定义",
};

const typeOptions: AdminContactType[] = [
  "email",
  "github",
  "twitter",
  "telegram",
  "rss",
  "custom",
];

function createLocalContactId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `ct-${crypto.randomUUID()}`;
  }

  return `ct-${Date.now()}`;
}

export default function ContactsPage() {
  const [items, setItems] = useState<AdminContactMethodViewModel[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState<AdminContactType>("email");
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    setActionError(null);

    try {
      const response = await listAdminContacts();
      setItems(response.map(toContactMethodViewModel));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "无法加载联系方式");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);

  function reset() {
    setEditingId(null);
    setType("email");
    setLabel("");
    setValue("");
    setActionError(null);
  }

  function startEdit(contact: AdminContactMethodViewModel) {
    setEditingId(contact.id);
    setType(contact.type);
    setLabel(contact.label);
    setValue(contact.value);
    setActionError(null);
  }

  async function persistContacts(nextItems: AdminContactMethodViewModel[]) {
    setSaving(true);
    setActionError(null);

    try {
      const response = await updateAdminContacts(toSiteContactsMutationRequest(nextItems));
      setItems(response.map(toContactMethodViewModel));
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : "保存联系方式失败");
    } finally {
      setSaving(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    if (!label.trim() || !value.trim()) {
      setActionError("请填写显示名称和链接 / 地址");
      return;
    }

    const nextItems = editingId
      ? items.map((contact) =>
          contact.id === editingId
            ? {
                ...contact,
                type,
                label: label.trim(),
                value: value.trim(),
              }
            : contact,
        )
      : [
          ...items,
          {
            id: createLocalContactId(),
            apiId: null,
            type,
            label: label.trim(),
            value: value.trim(),
            visible: true,
            sortOrder: items.length + 1,
          },
        ];

    await persistContacts(nextItems);
    reset();
  }

  async function remove(id: string) {
    if (!confirm("确认删除该联系方式？")) {
      return;
    }

    await persistContacts(items.filter((contact) => contact.id !== id));

    if (editingId === id) {
      reset();
    }
  }

  async function toggleVisible(id: string) {
    await persistContacts(
      items.map((contact) =>
        contact.id === id ? { ...contact, visible: !contact.visible } : contact,
      ),
    );
  }

  if (loading) {
    return <AdminLoadingState label="正在加载联系方式" />;
  }

  if (error) {
    return <AdminErrorState message={error} onRetry={loadContacts} />;
  }

  return (
    <>
      <PageHeader
        title="联系方式"
        description="管理出现在站点页脚或关于页的联系方式。可控制显示与隐藏。"
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
          <div className="text-sm font-medium">{editingId ? "编辑联系方式" : "新增联系方式"}</div>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-normal text-muted-foreground">类型</Label>
              <Select value={type} onValueChange={(nextType) => setType(nextType as AdminContactType)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {typeLabels[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-normal text-muted-foreground">显示名称</Label>
              <Input
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="GitHub"
                className="h-8"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-normal text-muted-foreground">链接 / 地址</Label>
              <Input
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="https://github.com/yourname"
                className="h-8 font-mono text-sm"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button type="submit" size="sm" className="h-8" disabled={saving}>
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

        <section className="overflow-hidden rounded-md border border-border">
          <div className="hidden h-10 grid-cols-[24px_120px_140px_1fr_80px_100px] items-center gap-4 border-b border-border bg-muted/40 px-4 text-xs text-muted-foreground md:grid">
            <div />
            <div>类型</div>
            <div>名称</div>
            <div>地址</div>
            <div>显示</div>
            <div className="text-right">操作</div>
          </div>
          <ul className="divide-y divide-border">
            {items.map((contact) => (
              <li
                key={contact.id}
                className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-2.5 md:grid-cols-[24px_120px_140px_1fr_80px_100px]"
              >
                <div className="hidden items-center justify-center text-muted-foreground/60 md:flex">
                  <GripVertical className="h-3.5 w-3.5" />
                </div>
                <div className="hidden text-sm text-muted-foreground md:block">
                  {typeLabels[contact.type]}
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-medium">{contact.label}</span>
                  <span className="truncate font-mono text-xs text-muted-foreground md:hidden">
                    {contact.value}
                  </span>
                </div>
                <div className="hidden truncate font-mono text-xs text-muted-foreground md:block">
                  {contact.value}
                </div>
                <div className="hidden items-center gap-2 md:flex">
                  <Switch
                    checked={contact.visible}
                    onCheckedChange={() => void toggleVisible(contact.id)}
                    aria-label={`显示 ${contact.label}`}
                    disabled={saving}
                  />
                  <span className="text-xs text-muted-foreground">
                    {contact.visible ? "公开" : "隐藏"}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground md:hidden"
                    onClick={() => void toggleVisible(contact.id)}
                    aria-label={`切换 ${contact.label} 显示`}
                    disabled={saving}
                  >
                    {contact.visible ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => startEdit(contact)}
                    aria-label={`编辑 ${contact.label}`}
                    disabled={saving}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => void remove(contact.id)}
                    aria-label={`删除 ${contact.label}`}
                    disabled={saving}
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
