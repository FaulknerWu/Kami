import type {
  AdminApiStatus,
  AdminArticleDetailResponse,
  AdminArticleMutationInput,
  AdminArticleMutationRequest,
  AdminArticleSummaryResponse,
  AdminCategoryResponse,
  AdminCategoryViewModel,
  AdminContactMethodViewModel,
  AdminContactType,
  AdminContentStatus,
  AdminEditorInitialViewModel,
  AdminPageDetailResponse,
  AdminPageListItemViewModel,
  AdminPageMutationInput,
  AdminPageMutationRequest,
  AdminPageSummaryResponse,
  AdminPostListItemViewModel,
  AdminSiteContactResponse,
  AdminSiteContactsMutationRequest,
  AdminSiteProfileMutationRequest,
  AdminSiteProfileResponse,
  AdminSiteSettingsViewModel,
  AdminTagResponse,
  AdminTagViewModel,
} from "@/lib/admin/types";

const EMPTY_DATE_LABEL = "—";
const DEFAULT_UNCATEGORIZED_LABEL = "未分类";
const EMPTY_SELECT_VALUE = "";

function normalizeNullableText(value: string | null | undefined) {
  const normalizedValue = value?.trim();
  return normalizedValue && normalizedValue.length > 0 ? normalizedValue : null;
}

function formatAdminDateTime(value: string | null | undefined) {
  if (!value) {
    return EMPTY_DATE_LABEL;
  }

  return value.replace("T", " ").slice(0, 16);
}

function parseOptionalId(value: string) {
  if (!value || value === EMPTY_SELECT_VALUE) {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

export function toAdminContentStatus(status: AdminApiStatus): AdminContentStatus {
  return status === "PUBLISHED" ? "published" : "draft";
}

export function toApiContentStatus(status: AdminContentStatus): AdminApiStatus {
  return status === "published" ? "PUBLISHED" : "DRAFT";
}

export function toCategoryViewModel(
  category: AdminCategoryResponse,
  count = 0,
): AdminCategoryViewModel {
  return {
    id: String(category.id),
    apiId: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    count,
    sortOrder: category.sortOrder,
  };
}

export function toTagViewModel(tag: AdminTagResponse, count = 0): AdminTagViewModel {
  return {
    id: String(tag.id),
    apiId: tag.id,
    name: tag.name,
    slug: tag.slug,
    count,
  };
}

export function toPostListItemViewModel(
  post: AdminArticleSummaryResponse,
): AdminPostListItemViewModel {
  return {
    id: String(post.id),
    apiId: post.id,
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    status: toAdminContentStatus(post.status),
    categoryId: post.category ? String(post.category.id) : EMPTY_SELECT_VALUE,
    categoryName: post.category?.name ?? DEFAULT_UNCATEGORIZED_LABEL,
    tags: post.tags.map((tag) => toTagViewModel(tag)),
    updatedAtLabel: formatAdminDateTime(post.updatedAt),
    publishedAtLabel: formatAdminDateTime(post.publishedAt),
  };
}

export function toPostEditorInitialViewModel(
  post: AdminArticleDetailResponse,
): AdminEditorInitialViewModel {
  return {
    id: String(post.id),
    apiId: post.id,
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    content: post.content,
    cover: post.coverImage ?? "",
    status: toAdminContentStatus(post.status),
    categoryId: post.category ? String(post.category.id) : EMPTY_SELECT_VALUE,
    tagIds: post.tags.map((tag) => String(tag.id)),
    publishedAt: post.publishedAt,
  };
}

export function toPageListItemViewModel(
  page: AdminPageSummaryResponse,
): AdminPageListItemViewModel {
  return {
    id: String(page.id),
    apiId: page.id,
    title: page.title,
    slug: page.slug,
    summary: page.summary ?? "",
    status: toAdminContentStatus(page.status),
    updatedAtLabel: formatAdminDateTime(page.updatedAt),
    publishedAtLabel: formatAdminDateTime(page.publishedAt),
  };
}

export function toPageEditorInitialViewModel(
  page: AdminPageDetailResponse,
): AdminEditorInitialViewModel {
  return {
    id: String(page.id),
    apiId: page.id,
    title: page.title,
    slug: page.slug,
    summary: page.summary ?? "",
    content: page.contentMarkdown ?? "",
    cover: page.coverImage ?? "",
    status: toAdminContentStatus(page.status),
    categoryId: EMPTY_SELECT_VALUE,
    tagIds: [],
    publishedAt: page.publishedAt,
  };
}

export function toArticleMutationRequest(
  input: AdminArticleMutationInput,
): AdminArticleMutationRequest {
  return {
    title: input.title.trim(),
    slug: input.slug.trim(),
    summary: input.summary.trim(),
    content: input.content,
    coverImage: normalizeNullableText(input.cover),
    categoryId: parseOptionalId(input.categoryId),
    tagIds: input.tagIds
      .map((tagId) => Number(tagId))
      .filter((tagId) => Number.isFinite(tagId)),
  };
}

export function toPageMutationRequest(input: AdminPageMutationInput): AdminPageMutationRequest {
  return {
    slug: input.slug.trim(),
    title: input.title.trim(),
    summary: normalizeNullableText(input.summary),
    coverImage: normalizeNullableText(input.cover),
    contentMarkdown: input.content,
    seoTitle: null,
    seoDescription: null,
  };
}

export function toSiteSettingsViewModel(
  profile: AdminSiteProfileResponse,
): AdminSiteSettingsViewModel {
  return {
    siteName: profile.siteName,
    homeTitle: profile.heroTitle ?? "",
    subtitle: profile.heroTagline ?? "",
    authorName: profile.authorName,
    authorBio: profile.authorBio ?? "",
    avatar: profile.avatarUrl ?? "",
    cover: profile.coverImageUrl ?? "",
    shareImage: profile.defaultShareImageUrl ?? "",
    siteUrl: profile.canonicalBaseUrl ?? "",
  };
}

export function toSiteProfileMutationRequest(
  settings: AdminSiteSettingsViewModel,
): AdminSiteProfileMutationRequest {
  return {
    siteName: settings.siteName.trim(),
    heroTitle: normalizeNullableText(settings.homeTitle),
    heroTagline: normalizeNullableText(settings.subtitle),
    authorName: settings.authorName.trim(),
    authorBio: normalizeNullableText(settings.authorBio),
    avatarUrl: normalizeNullableText(settings.avatar),
    coverImageUrl: normalizeNullableText(settings.cover),
    canonicalBaseUrl: normalizeNullableText(settings.siteUrl),
    defaultShareImageUrl: normalizeNullableText(settings.shareImage),
  };
}

export function toContactMethodViewModel(
  contact: AdminSiteContactResponse,
): AdminContactMethodViewModel {
  return {
    id: String(contact.id),
    apiId: contact.id,
    type: toContactType(contact.type),
    label: contact.label,
    value: contact.url ?? contact.value ?? "",
    visible: contact.isPublic,
    sortOrder: contact.sortOrder,
  };
}

export function toContactType(type: string): AdminContactType {
  const normalizedType = type.toLowerCase();

  if (
    normalizedType === "email" ||
    normalizedType === "github" ||
    normalizedType === "twitter" ||
    normalizedType === "telegram" ||
    normalizedType === "rss"
  ) {
    return normalizedType;
  }

  return "custom";
}

export function toSiteContactsMutationRequest(
  contacts: AdminContactMethodViewModel[],
): AdminSiteContactsMutationRequest {
  return {
    contacts: contacts.map((contact, index) => {
      const value = normalizeNullableText(contact.value);
      const isEmail = contact.type === "email";

      return {
        type: contact.type.toUpperCase(),
        label: contact.label.trim(),
        value: isEmail ? value : null,
        url: isEmail ? null : value,
        sortOrder: index + 1,
        isPublic: contact.visible,
      };
    }),
  };
}
