export type AdminApiStatus = "DRAFT" | "PUBLISHED";
export type AdminContentStatus = "draft" | "published";

export interface AdminLoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface AdminCategoryResponse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
}

export interface AdminTagResponse {
  id: number;
  name: string;
  slug: string;
}

export interface AdminArticleSummaryResponse {
  id: number;
  title: string;
  slug: string;
  summary: string;
  wordCount: number;
  readingTimeMinutes: number;
  status: AdminApiStatus;
  category: AdminCategoryResponse | null;
  tags: AdminTagResponse[];
  publishedAt?: string | null;
  updatedAt?: string | null;
}

export interface AdminArticleDetailResponse extends AdminArticleSummaryResponse {
  content: string;
  coverImage: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPageSummaryResponse {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  status: AdminApiStatus;
  publishedAt: string | null;
  updatedAt: string;
}

export interface AdminPageDetailResponse extends AdminPageSummaryResponse {
  coverImage: string | null;
  contentMarkdown: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
}

export interface AdminSiteProfileResponse {
  id: number;
  siteName: string;
  heroTitle: string | null;
  heroTagline: string | null;
  authorName: string;
  authorBio: string | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  canonicalBaseUrl: string | null;
  defaultShareImageUrl: string | null;
}

export interface AdminSiteContactResponse {
  id: number;
  type: string;
  label: string;
  value: string | null;
  url: string | null;
  sortOrder: number;
  isPublic: boolean;
}

export interface AdminPageResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface AdminCategoryViewModel {
  id: string;
  apiId: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  sortOrder: number;
}

export interface AdminTagViewModel {
  id: string;
  apiId: number;
  name: string;
  slug: string;
  count: number;
}

export interface AdminPostListItemViewModel {
  id: string;
  apiId: number;
  title: string;
  slug: string;
  summary: string;
  status: AdminContentStatus;
  categoryId: string;
  categoryName: string;
  tags: AdminTagViewModel[];
  updatedAtLabel: string;
  publishedAtLabel: string;
}

export interface AdminPageListItemViewModel {
  id: string;
  apiId: number;
  title: string;
  slug: string;
  summary: string;
  status: AdminContentStatus;
  updatedAtLabel: string;
  publishedAtLabel: string;
}

export interface AdminEditorInitialViewModel {
  id: string;
  apiId: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover: string;
  status: AdminContentStatus;
  categoryId: string;
  tagIds: string[];
  publishedAt: string | null;
}

export interface AdminSiteSettingsViewModel {
  siteName: string;
  homeTitle: string;
  subtitle: string;
  authorName: string;
  authorBio: string;
  avatar: string;
  cover: string;
  shareImage: string;
  siteUrl: string;
}

export type AdminContactType =
  | "email"
  | "github"
  | "twitter"
  | "telegram"
  | "rss"
  | "custom";

export interface AdminContactMethodViewModel {
  id: string;
  apiId: number | null;
  type: AdminContactType;
  label: string;
  value: string;
  visible: boolean;
  sortOrder: number;
}

export interface AdminArticleMutationInput {
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover: string;
  categoryId: string;
  tagIds: string[];
}

export interface AdminPageMutationInput {
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover: string;
}

export interface AdminArticleMutationRequest {
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string | null;
  categoryId: number | null;
  tagIds: number[];
}

export interface AdminPageMutationRequest {
  slug: string;
  title: string;
  summary: string | null;
  coverImage: string | null;
  contentMarkdown: string;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface AdminSiteProfileMutationRequest {
  siteName: string;
  heroTitle: string | null;
  heroTagline: string | null;
  authorName: string;
  authorBio: string | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  canonicalBaseUrl: string | null;
  defaultShareImageUrl: string | null;
}

export interface AdminSiteContactsMutationRequest {
  contacts: Array<{
    type: string;
    label: string;
    value: string | null;
    url: string | null;
    sortOrder: number;
    isPublic: boolean;
  }>;
}
