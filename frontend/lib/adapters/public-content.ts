import type {
  ApiPageRenderMode,
  ApiPostDetail,
  ApiPostSummary,
  ApiPublicPage,
  ApiPublicCategory,
  ApiPublicSiteProfile,
  ApiPublicTag,
  ApiSiteContact,
} from "@/lib/api/types";
import {
  formatReadTimeLabel,
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

export interface SiteContactViewModel {
  id: number;
  type: string;
  typeLabel: string;
  label: string;
  value: string | null;
  href: string | null;
}

export interface SiteProfileViewModel {
  id: number;
  siteName: string;
  heroTitle: string;
  heroTagline: string | null;
  authorName: string;
  authorBio: string | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  contacts: SiteContactViewModel[];
}

export interface AboutSectionViewModel {
  title: string;
  paragraphs: string[];
}

export interface AboutPageViewModel {
  slug: string;
  title: string;
  summary: string | null;
  coverImage: string | null;
  renderMode: ApiPageRenderMode;
  contentMarkdown: string | null;
  sections: AboutSectionViewModel[];
  skills: string[];
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

function resolveReadTimeLabel(readingTimeMinutes: number) {
  return formatReadTimeLabel(readingTimeMinutes);
}

function resolveContactHref(contact: ApiSiteContact) {
  if (contact.url?.trim()) {
    return contact.url;
  }

  if (contact.type === "EMAIL" && contact.value?.trim()) {
    return `mailto:${contact.value}`;
  }

  return null;
}

function resolveContactTypeLabel(type: string) {
  switch (type) {
    case "EMAIL":
      return "Email";
    case "GITHUB":
      return "GitHub";
    default:
      return type;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function readAboutSections(value: unknown): AboutSectionViewModel[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const title = readString(item.title);
    if (!title) {
      return [];
    }

    return [{
      title,
      paragraphs: readStringArray(item.paragraphs),
    }];
  });
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
    readTimeLabel: resolveReadTimeLabel(post.readingTimeMinutes),
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
      readTimeLabel: resolveReadTimeLabel(post.readingTimeMinutes),
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

export function toSiteProfileViewModel(siteProfile: ApiPublicSiteProfile): SiteProfileViewModel {
  return {
    id: siteProfile.id,
    siteName: siteProfile.siteName,
    heroTitle: siteProfile.heroTitle?.trim() || siteProfile.siteName,
    heroTagline: siteProfile.heroTagline?.trim() || null,
    authorName: siteProfile.authorName,
    authorBio: siteProfile.authorBio?.trim() || null,
    avatarUrl: siteProfile.avatarUrl?.trim() || null,
    coverImageUrl: siteProfile.coverImageUrl?.trim() || null,
    contacts: siteProfile.contacts.map((contact) => ({
      id: contact.id,
      type: contact.type,
      typeLabel: resolveContactTypeLabel(contact.type),
      label: contact.label,
      value: contact.value,
      href: resolveContactHref(contact),
    })),
  };
}

export function toAboutPageViewModel(page: ApiPublicPage): AboutPageViewModel {
  const payload = isRecord(page.payload) ? page.payload : null;

  return {
    slug: page.slug,
    title: page.title,
    summary: page.summary?.trim() || null,
    coverImage: page.coverImage?.trim() || null,
    renderMode: page.renderMode,
    contentMarkdown: page.contentMarkdown?.trim() || null,
    sections: readAboutSections(payload?.sections),
    skills: readStringArray(payload?.skills),
  };
}
