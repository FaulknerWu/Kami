"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminErrorState, AdminLoadingState } from "@/components/admin/feedback";
import { PostEditor } from "@/components/admin/post-editor";
import {
  deleteAdminPost,
  getAdminPost,
  listAdminCategories,
  listAdminTags,
  publishAdminPost,
  unpublishAdminPost,
  updateAdminPost,
} from "@/lib/admin/api";
import {
  toAdminContentStatus,
  toArticleMutationRequest,
  toCategoryViewModel,
  toPostEditorInitialViewModel,
  toTagViewModel,
} from "@/lib/admin/adapters";
import type {
  AdminArticleMutationInput,
  AdminCategoryViewModel,
  AdminContentStatus,
  AdminEditorInitialViewModel,
  AdminPageMutationInput,
  AdminTagViewModel,
} from "@/lib/admin/types";

export default function EditPostPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const postId = params.id;
  const [initial, setInitial] = useState<AdminEditorInitialViewModel | null>(null);
  const [categories, setCategories] = useState<AdminCategoryViewModel[]>([]);
  const [tags, setTags] = useState<AdminTagViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEditor = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [postResponse, categoryResponse, tagResponse] = await Promise.all([
        getAdminPost(postId),
        listAdminCategories(),
        listAdminTags(),
      ]);

      setInitial(toPostEditorInitialViewModel(postResponse));
      setCategories(categoryResponse.map((category) => toCategoryViewModel(category)));
      setTags(tagResponse.map((tag) => toTagViewModel(tag)));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "无法加载文章");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    void loadEditor();
  }, [loadEditor]);

  async function savePost(
    input: AdminArticleMutationInput | AdminPageMutationInput,
    status: AdminContentStatus,
  ) {
    const updatedPost = await updateAdminPost(
      postId,
      toArticleMutationRequest(input as AdminArticleMutationInput),
    );
    const finalPost =
      status === "published"
        ? await publishAdminPost(updatedPost.id)
        : await unpublishAdminPost(updatedPost.id);
    setInitial(toPostEditorInitialViewModel(finalPost));

    return {
      status: toAdminContentStatus(finalPost.status),
    };
  }

  async function removePost() {
    await deleteAdminPost(postId);
    router.push("/admin/posts");
  }

  if (loading) {
    return <AdminLoadingState label="正在加载文章" />;
  }

  if (error || !initial) {
    return <AdminErrorState message={error ?? "文章不存在"} onRetry={loadEditor} />;
  }

  return (
    <PostEditor
      mode="post"
      initial={initial}
      categories={categories}
      tags={tags}
      onSave={savePost}
      onDelete={removePost}
    />
  );
}
