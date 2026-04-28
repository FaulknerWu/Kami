"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminErrorState, AdminLoadingState } from "@/components/admin/feedback";
import { PostEditor } from "@/components/admin/post-editor";
import {
  deleteAdminPage,
  getAdminPage,
  publishAdminPage,
  unpublishAdminPage,
  updateAdminPage,
} from "@/lib/admin/api";
import {
  toAdminContentStatus,
  toPageEditorInitialViewModel,
  toPageMutationRequest,
} from "@/lib/admin/adapters";
import type {
  AdminArticleMutationInput,
  AdminContentStatus,
  AdminEditorInitialViewModel,
  AdminPageMutationInput,
} from "@/lib/admin/types";

export default function EditPageRoute() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const pageId = params.id;
  const [initial, setInitial] = useState<AdminEditorInitialViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const page = await getAdminPage(pageId);
      setInitial(toPageEditorInitialViewModel(page));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "无法加载页面");
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  async function savePage(
    input: AdminArticleMutationInput | AdminPageMutationInput,
    status: AdminContentStatus,
  ) {
    const updatedPage = await updateAdminPage(
      pageId,
      toPageMutationRequest(input as AdminPageMutationInput),
    );
    const finalPage =
      status === "published"
        ? await publishAdminPage(updatedPage.id)
        : await unpublishAdminPage(updatedPage.id);
    setInitial(toPageEditorInitialViewModel(finalPage));

    return {
      status: toAdminContentStatus(finalPage.status),
    };
  }

  async function removePage() {
    await deleteAdminPage(pageId);
    router.push("/admin/pages");
  }

  if (loading) {
    return <AdminLoadingState label="正在加载页面" />;
  }

  if (error || !initial) {
    return <AdminErrorState message={error ?? "页面不存在"} onRetry={loadPage} />;
  }

  return <PostEditor mode="page" initial={initial} onSave={savePage} onDelete={removePage} />;
}
