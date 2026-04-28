"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminErrorState, AdminLoadingState } from "@/components/admin/feedback";
import { PostEditor } from "@/components/admin/post-editor";
import {
  createAdminPost,
  listAdminCategories,
  listAdminTags,
  publishAdminPost,
} from "@/lib/admin/api";
import {
  toAdminContentStatus,
  toArticleMutationRequest,
  toCategoryViewModel,
  toTagViewModel,
} from "@/lib/admin/adapters";
import type {
  AdminArticleMutationInput,
  AdminCategoryViewModel,
  AdminContentStatus,
  AdminPageMutationInput,
  AdminTagViewModel,
} from "@/lib/admin/types";

export default function NewPostPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<AdminCategoryViewModel[]>([]);
  const [tags, setTags] = useState<AdminTagViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTaxonomy = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [categoryResponse, tagResponse] = await Promise.all([
        listAdminCategories(),
        listAdminTags(),
      ]);

      setCategories(categoryResponse.map((category) => toCategoryViewModel(category)));
      setTags(tagResponse.map((tag) => toTagViewModel(tag)));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "无法加载编辑器数据");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTaxonomy();
  }, [loadTaxonomy]);

  async function savePost(
    input: AdminArticleMutationInput | AdminPageMutationInput,
    status: AdminContentStatus,
  ) {
    const createdPost = await createAdminPost(
      toArticleMutationRequest(input as AdminArticleMutationInput),
    );
    const finalPost =
      status === "published" ? await publishAdminPost(createdPost.id) : createdPost;
    router.replace(`/admin/posts/${finalPost.id}`);

    return {
      status: toAdminContentStatus(finalPost.status),
    };
  }

  if (loading) {
    return <AdminLoadingState label="正在加载编辑器" />;
  }

  if (error) {
    return <AdminErrorState message={error} onRetry={loadTaxonomy} />;
  }

  return (
    <PostEditor
      mode="post"
      isNew
      categories={categories}
      tags={tags}
      onSave={savePost}
    />
  );
}
