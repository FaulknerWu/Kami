import type { ApiProblemDetail } from "@/lib/api/types";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8080";

function getApiBaseUrl() {
  const configuredBaseUrl = process.env.KAMI_API_BASE_URL?.trim();
  const baseUrl = configuredBaseUrl && configuredBaseUrl.length > 0
    ? configuredBaseUrl
    : DEFAULT_API_BASE_URL;

  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

function buildRequestUrl(
  pathname: string,
  searchParams?: Record<string, string | number | undefined>,
) {
  const normalizedPathname = pathname.startsWith("/")
    ? pathname.slice(1)
    : pathname;
  const requestUrl = new URL(normalizedPathname, getApiBaseUrl());

  if (!searchParams) {
    return requestUrl;
  }

  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) {
      continue;
    }

    requestUrl.searchParams.set(key, String(value));
  }

  return requestUrl;
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

export class ApiError extends Error {
  status: number;
  problemDetail: ApiProblemDetail | null;

  constructor(status: number, message: string, problemDetail: ApiProblemDetail | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.problemDetail = problemDetail;
  }
}

export class ApiNotFoundError extends ApiError {
  constructor(message: string, problemDetail: ApiProblemDetail | null) {
    super(404, message, problemDetail);
    this.name = "ApiNotFoundError";
  }
}

export async function getJson<T>(
  pathname: string,
  searchParams?: Record<string, string | number | undefined>,
) {
  const response = await fetch(buildRequestUrl(pathname, searchParams), {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const problemDetail = await readProblemDetail(response);
    const message = problemDetail?.detail ?? response.statusText ?? "请求失败";

    if (response.status === 404) {
      throw new ApiNotFoundError(message, problemDetail);
    }

    throw new ApiError(response.status, message, problemDetail);
  }

  return (await response.json()) as T;
}
