import type { ApiProblemDetail } from "@/lib/api/types";
import { clearAdminSession, getAdminAuthorizationHeader } from "@/lib/admin/auth";
import type {
  AdminArticleDetailResponse,
  AdminArticleMutationRequest,
  AdminArticleSummaryResponse,
  AdminCategoryResponse,
  AdminLoginResponse,
  AdminPageDetailResponse,
  AdminPageMutationRequest,
  AdminPageResponse,
  AdminPageSummaryResponse,
  AdminSiteContactResponse,
  AdminSiteContactsMutationRequest,
  AdminSiteProfileMutationRequest,
  AdminSiteProfileResponse,
  AdminTagResponse,
} from "@/lib/admin/types";

const ADMIN_API_PREFIX = "/api/kami/admin";

interface AdminRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  searchParams?: Record<string, string | number | undefined>;
  auth?: boolean;
}

export class AdminApiError extends Error {
  status: number;
  problemDetail: ApiProblemDetail | null;

  constructor(status: number, message: string, problemDetail: ApiProblemDetail | null) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.problemDetail = problemDetail;
  }
}

export class AdminUnauthorizedError extends AdminApiError {
  constructor(message: string, problemDetail: ApiProblemDetail | null) {
    super(401, message, problemDetail);
    this.name = "AdminUnauthorizedError";
  }
}

function buildAdminApiUrl(pathname: string, searchParams?: AdminRequestOptions["searchParams"]) {
  const normalizedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  }

  const queryString = params.toString();
  return `${ADMIN_API_PREFIX}${normalizedPathname}${queryString ? `?${queryString}` : ""}`;
}

async function readProblemDetail(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("json")) {
    return null;
  }

  try {
    return (await response.json()) as ApiProblemDetail;
  } catch {
    return null;
  }
}

async function adminRequest<T>(pathname: string, options: AdminRequestOptions = {}) {
  const method = options.method ?? "GET";
  const headers = new Headers({
    Accept: "application/json",
  });

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false) {
    const authorization = getAdminAuthorizationHeader();

    if (!authorization) {
      throw new AdminUnauthorizedError("登录状态已失效", null);
    }

    headers.set("Authorization", authorization);
  }

  const response = await fetch(buildAdminApiUrl(pathname, options.searchParams), {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });

  if (!response.ok) {
    const problemDetail = await readProblemDetail(response);
    const message = problemDetail?.detail ?? response.statusText ?? "请求失败";

    if (response.status === 401) {
      clearAdminSession();
      throw new AdminUnauthorizedError(message, problemDetail);
    }

    throw new AdminApiError(response.status, message, problemDetail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function loginAdmin(password: string) {
  return adminRequest<AdminLoginResponse>("/auth/login", {
    method: "POST",
    body: { password },
    auth: false,
  });
}

export function listAdminPosts(page = 1, size = 100) {
  return adminRequest<AdminPageResponse<AdminArticleSummaryResponse>>("/posts", {
    searchParams: { page, size },
  });
}

export function getAdminPost(id: string | number) {
  return adminRequest<AdminArticleDetailResponse>(`/posts/${id}`);
}

export function createAdminPost(body: AdminArticleMutationRequest) {
  return adminRequest<AdminArticleDetailResponse>("/posts", {
    method: "POST",
    body,
  });
}

export function updateAdminPost(id: string | number, body: AdminArticleMutationRequest) {
  return adminRequest<AdminArticleDetailResponse>(`/posts/${id}`, {
    method: "PUT",
    body,
  });
}

export function deleteAdminPost(id: string | number) {
  return adminRequest<void>(`/posts/${id}`, {
    method: "DELETE",
  });
}

export function publishAdminPost(id: string | number) {
  return adminRequest<AdminArticleDetailResponse>(`/posts/${id}/publish`, {
    method: "PUT",
  });
}

export function unpublishAdminPost(id: string | number) {
  return adminRequest<AdminArticleDetailResponse>(`/posts/${id}/unpublish`, {
    method: "PUT",
  });
}

export function listAdminPages(page = 1, size = 100) {
  return adminRequest<AdminPageResponse<AdminPageSummaryResponse>>("/pages", {
    searchParams: { page, size },
  });
}

export function getAdminPage(id: string | number) {
  return adminRequest<AdminPageDetailResponse>(`/pages/${id}`);
}

export function createAdminPage(body: AdminPageMutationRequest) {
  return adminRequest<AdminPageDetailResponse>("/pages", {
    method: "POST",
    body,
  });
}

export function updateAdminPage(id: string | number, body: AdminPageMutationRequest) {
  return adminRequest<AdminPageDetailResponse>(`/pages/${id}`, {
    method: "PUT",
    body,
  });
}

export function deleteAdminPage(id: string | number) {
  return adminRequest<void>(`/pages/${id}`, {
    method: "DELETE",
  });
}

export function publishAdminPage(id: string | number) {
  return adminRequest<AdminPageDetailResponse>(`/pages/${id}/publish`, {
    method: "PUT",
  });
}

export function unpublishAdminPage(id: string | number) {
  return adminRequest<AdminPageDetailResponse>(`/pages/${id}/unpublish`, {
    method: "PUT",
  });
}

export function listAdminCategories() {
  return adminRequest<AdminCategoryResponse[]>("/categories");
}

export function createAdminCategory(body: Omit<AdminCategoryResponse, "id">) {
  return adminRequest<AdminCategoryResponse>("/categories", {
    method: "POST",
    body,
  });
}

export function updateAdminCategory(id: string | number, body: Omit<AdminCategoryResponse, "id">) {
  return adminRequest<AdminCategoryResponse>(`/categories/${id}`, {
    method: "PUT",
    body,
  });
}

export function deleteAdminCategory(id: string | number) {
  return adminRequest<void>(`/categories/${id}`, {
    method: "DELETE",
  });
}

export function listAdminTags() {
  return adminRequest<AdminTagResponse[]>("/tags");
}

export function createAdminTag(body: Omit<AdminTagResponse, "id">) {
  return adminRequest<AdminTagResponse>("/tags", {
    method: "POST",
    body,
  });
}

export function updateAdminTag(id: string | number, body: Omit<AdminTagResponse, "id">) {
  return adminRequest<AdminTagResponse>(`/tags/${id}`, {
    method: "PUT",
    body,
  });
}

export function deleteAdminTag(id: string | number) {
  return adminRequest<void>(`/tags/${id}`, {
    method: "DELETE",
  });
}

export function getAdminSiteProfile() {
  return adminRequest<AdminSiteProfileResponse>("/site/profile");
}

export function updateAdminSiteProfile(body: AdminSiteProfileMutationRequest) {
  return adminRequest<AdminSiteProfileResponse>("/site/profile", {
    method: "PUT",
    body,
  });
}

export function listAdminContacts() {
  return adminRequest<AdminSiteContactResponse[]>("/site/contacts");
}

export function updateAdminContacts(body: AdminSiteContactsMutationRequest) {
  return adminRequest<AdminSiteContactResponse[]>("/site/contacts", {
    method: "PUT",
    body,
  });
}
