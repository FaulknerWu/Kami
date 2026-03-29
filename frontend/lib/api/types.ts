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
  publishedAt: string;
  category: ApiCategory | null;
  tags: ApiTag[];
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
