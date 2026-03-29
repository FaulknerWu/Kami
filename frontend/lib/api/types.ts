export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
}

export interface ApiTag {
  id: number;
  name: string;
  slug: string;
}

export interface ApiPublicCategory extends ApiCategory {
  articleCount: number;
}

export interface ApiPublicTag extends ApiTag {
  articleCount: number;
}

export interface ApiPostSummary {
  id: number;
  title: string;
  slug: string;
  summary: string;
  coverImage: string | null;
  wordCount: number;
  readingTimeMinutes: number;
  publishedAt: string;
  category: ApiCategory | null;
  tags: ApiTag[];
}

export interface ApiPostDetail {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string | null;
  wordCount: number;
  readingTimeMinutes: number;
  publishedAt: string;
  category: ApiCategory | null;
  tags: ApiTag[];
}

export type ApiPageRenderMode = "CODED" | "MARKDOWN";

export interface ApiSiteContact {
  id: number;
  type: string;
  label: string;
  value: string | null;
  url: string | null;
  sortOrder: number;
  isPublic: boolean;
}

export interface ApiPublicSiteProfile {
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
  contacts: ApiSiteContact[];
}

export interface ApiPublicPage<TPayload = unknown> {
  slug: string;
  title: string;
  summary: string | null;
  coverImage: string | null;
  renderMode: ApiPageRenderMode;
  contentMarkdown: string | null;
  payload: TPayload | null;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string;
}

export interface ApiPageResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface ApiProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  timestamp?: string;
  errors?: Record<string, string>;
}
