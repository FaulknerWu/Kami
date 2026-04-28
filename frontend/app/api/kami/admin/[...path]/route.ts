import { NextRequest } from "next/server";

const DEFAULT_API_BASE_URL = "http://127.0.0.1:8080";

type AdminProxyContext = {
  params: Promise<{
    path: string[];
  }>;
};

function getApiBaseUrl() {
  const configuredBaseUrl = process.env.KAMI_API_BASE_URL?.trim();
  const baseUrl =
    configuredBaseUrl && configuredBaseUrl.length > 0
      ? configuredBaseUrl
      : DEFAULT_API_BASE_URL;

  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

function buildBackendUrl(path: string[], search: string) {
  const pathname = `api/admin/${path.map(encodeURIComponent).join("/")}`;
  const backendUrl = new URL(pathname, getApiBaseUrl());
  backendUrl.search = search;
  return backendUrl;
}

async function createProxyRequestInit(request: NextRequest): Promise<RequestInit> {
  const headers = new Headers();
  const authorization = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");

  headers.set("accept", "application/json");

  if (authorization) {
    headers.set("authorization", authorization);
  }

  if (contentType) {
    headers.set("content-type", contentType);
  }

  const canHaveBody = request.method !== "GET" && request.method !== "HEAD";

  return {
    method: request.method,
    headers,
    body: canHaveBody ? await request.arrayBuffer() : undefined,
    cache: "no-store",
  };
}

async function proxyAdminRequest(request: NextRequest, context: AdminProxyContext) {
  const { path } = await context.params;
  const backendUrl = buildBackendUrl(path, request.nextUrl.search);
  const backendResponse = await fetch(
    backendUrl,
    await createProxyRequestInit(request),
  );
  const responseHeaders = new Headers();
  const contentType = backendResponse.headers.get("content-type");

  if (contentType) {
    responseHeaders.set("content-type", contentType);
  }

  return new Response(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest, context: AdminProxyContext) {
  return proxyAdminRequest(request, context);
}

export async function POST(request: NextRequest, context: AdminProxyContext) {
  return proxyAdminRequest(request, context);
}

export async function PUT(request: NextRequest, context: AdminProxyContext) {
  return proxyAdminRequest(request, context);
}

export async function DELETE(request: NextRequest, context: AdminProxyContext) {
  return proxyAdminRequest(request, context);
}
