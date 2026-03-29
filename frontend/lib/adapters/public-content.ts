import type {
  ApiPostDetail,
  ApiPostSummary,
  ApiPublicCategory,
  ApiPublicTag,
} from "@/lib/api/types";
import {
  estimateReadTimeLabel,
  formatIsoDateLabel,
  formatMonthDayLabel,
  formatYearLabel,
} from "@/lib/formatters";

const UNCATEGORIZED_LABEL = "未分类";

export interface TagBadgeViewModel {
  id: number;
  name: string;
  slug: string;
}

export interface ArticleCardViewModel {
  id: number;
  slug: string;
  title: string;
  abstract: string;
  dateLabel: string;
  categoryName: string;
  categorySlug: string | null;
  tags: TagBadgeViewModel[];
  readTimeLabel: string;
}

export interface ArticleDetailViewModel extends ArticleCardViewModel {
  content: string;
  coverImage: string | null;
}

export interface TaxonomyListItemViewModel {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface ArchiveEntryViewModel {
  id: number;
  slug: string;
  title: string;
  dateLabel: string;
  monthDayLabel: string;
  categoryName: string;
  readTimeLabel: string;
}

export interface ArchiveYearGroupViewModel {
  year: string;
  items: ArchiveEntryViewModel[];
}

export interface SidebarStatsViewModel {
  articles: number;
  categories: number;
  tags: number;
}

function toTagBadgeViewModel(tag: { id: number; name: string; slug: string }): TagBadgeViewModel {
  return {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
  };
}

function resolveCategoryName(category: ApiPostSummary["category"]) {
  return category?.name ?? UNCATEGORIZED_LABEL;
}

function resolveCategorySlug(category: ApiPostSummary["category"]) {
  return category?.slug ?? null;
}

// TODO(ADR-0004): 后端暂未提供阅读时长字段，当前先按摘要长度统一估算，保证列表页与详情页一致。
function resolveReadTimeLabel(summary: string) {
  return estimateReadTimeLabel(summary);
}

export function toArticleCardViewModel(post: ApiPostSummary): ArticleCardViewModel {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    abstract: post.summary,
    dateLabel: formatIsoDateLabel(post.publishedAt),
    categoryName: resolveCategoryName(post.category),
    categorySlug: resolveCategorySlug(post.category),
    tags: post.tags.map(toTagBadgeViewModel),
    readTimeLabel: resolveReadTimeLabel(post.summary),
  };
}

export function toArticleDetailViewModel(post: ApiPostDetail): ArticleDetailViewModel {
  return {
    ...toArticleCardViewModel(post),
    content: post.content,
    coverImage: post.coverImage?.trim() ? post.coverImage : null,
  };
}

export function toCategoryListItemViewModels(categories: ApiPublicCategory[]): TaxonomyListItemViewModel[] {
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    count: category.articleCount,
  }));
}

export function toTagListItemViewModels(tags: ApiPublicTag[]): TaxonomyListItemViewModel[] {
  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    count: tag.articleCount,
  }));
}

export function toArchiveYearGroups(posts: ApiPostSummary[]): ArchiveYearGroupViewModel[] {
  const groups = new Map<string, ArchiveEntryViewModel[]>();
  const sortedPosts = [...posts].sort((left, right) =>
    right.publishedAt.localeCompare(left.publishedAt),
  );

  for (const post of sortedPosts) {
    const year = formatYearLabel(post.publishedAt);
    const currentItems = groups.get(year) ?? [];

    currentItems.push({
      id: post.id,
      slug: post.slug,
      title: post.title,
      dateLabel: formatIsoDateLabel(post.publishedAt),
      monthDayLabel: formatMonthDayLabel(post.publishedAt),
      categoryName: resolveCategoryName(post.category),
      readTimeLabel: resolveReadTimeLabel(post.summary),
    });

    groups.set(year, currentItems);
  }

  return [...groups.entries()].map(([year, items]) => ({
    year,
    items,
  }));
}

export function toSidebarStatsViewModel(
  totalArticles: number,
  totalCategories: number,
  totalTags: number,
): SidebarStatsViewModel {
  return {
    articles: totalArticles,
    categories: totalCategories,
    tags: totalTags,
  };
}
