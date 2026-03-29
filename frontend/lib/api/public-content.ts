import type {
  ApiPageResponse,
  ApiPostDetail,
  ApiPostSummary,
  ApiPublicCategory,
  ApiPublicTag,
} from "@/lib/api/types";
import { getJson } from "@/lib/api/http";

interface PublicPostPageOptions {
  page: number;
  size: number;
  category?: string;
  tag?: string;
}

export async function getPublicPostPage(options: PublicPostPageOptions) {
  return getJson<ApiPageResponse<ApiPostSummary>>("/api/posts", {
    page: options.page,
    size: options.size,
    category: options.category,
    tag: options.tag,
  });
}

export async function getAllPublicPosts(filters?: Pick<PublicPostPageOptions, "category" | "tag">) {
  const firstPage = await getPublicPostPage({
    page: 1,
    size: 100,
    ...filters,
  });

  if (firstPage.totalPages <= 1) {
    return firstPage.items;
  }

  const allPosts = [...firstPage.items];

  for (let currentPage = 2; currentPage <= firstPage.totalPages; currentPage += 1) {
    const nextPage = await getPublicPostPage({
      page: currentPage,
      size: 100,
      ...filters,
    });

    allPosts.push(...nextPage.items);
  }

  return allPosts;
}

export async function getPublicPostDetail(slug: string) {
  return getJson<ApiPostDetail>(`/api/posts/${slug}`);
}

export async function getPublicCategories() {
  return getJson<ApiPublicCategory[]>("/api/categories");
}

export async function getPublicTags() {
  return getJson<ApiPublicTag[]>("/api/tags");
}

export async function getPublicSidebarData() {
  const [categories, tags, posts] = await Promise.all([
    getPublicCategories(),
    getPublicTags(),
    getPublicPostPage({ page: 1, size: 1 }),
  ]);

  return {
    categories,
    tags,
    totalArticles: posts.total,
  };
}
