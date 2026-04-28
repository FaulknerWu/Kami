"use client";

import { useRouter } from "next/navigation";
import { PostEditor } from "@/components/admin/post-editor";
import { createAdminPage, publishAdminPage } from "@/lib/admin/api";
import {
  toAdminContentStatus,
  toPageMutationRequest,
} from "@/lib/admin/adapters";
import type {
  AdminArticleMutationInput,
  AdminContentStatus,
  AdminPageMutationInput,
} from "@/lib/admin/types";

export default function NewPagePage() {
  const router = useRouter();

  async function savePage(
    input: AdminArticleMutationInput | AdminPageMutationInput,
    status: AdminContentStatus,
  ) {
    const createdPage = await createAdminPage(
      toPageMutationRequest(input as AdminPageMutationInput),
    );
    const finalPage =
      status === "published" ? await publishAdminPage(createdPage.id) : createdPage;
    router.replace(`/admin/pages/${finalPage.id}`);

    return {
      status: toAdminContentStatus(finalPage.status),
    };
  }

  return <PostEditor mode="page" isNew onSave={savePage} />;
}
