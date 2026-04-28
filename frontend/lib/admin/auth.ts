import type { AdminLoginResponse } from "@/lib/admin/types";

const PERSISTENT_SESSION_KEY = "kami.admin.session";
const EPHEMERAL_SESSION_KEY = "kami.admin.session.ephemeral";

export interface AdminSession {
  accessToken: string;
  tokenType: string;
  expiresAt: number;
}

function hasBrowserStorage() {
  return typeof window !== "undefined";
}

function parseStoredSession(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AdminSession;
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  if (!hasBrowserStorage()) {
    return;
  }

  window.localStorage.removeItem(PERSISTENT_SESSION_KEY);
  window.sessionStorage.removeItem(EPHEMERAL_SESSION_KEY);
}

export function readAdminSession() {
  if (!hasBrowserStorage()) {
    return null;
  }

  const session =
    parseStoredSession(window.localStorage.getItem(PERSISTENT_SESSION_KEY)) ??
    parseStoredSession(window.sessionStorage.getItem(EPHEMERAL_SESSION_KEY));

  if (!session || session.expiresAt <= Date.now()) {
    clearAdminSession();
    return null;
  }

  return session;
}

export function storeAdminSession(response: AdminLoginResponse, remember: boolean) {
  if (!hasBrowserStorage()) {
    return;
  }

  const session: AdminSession = {
    accessToken: response.accessToken,
    tokenType: response.tokenType,
    expiresAt: Date.now() + response.expiresIn * 1000,
  };

  clearAdminSession();

  if (remember) {
    window.localStorage.setItem(PERSISTENT_SESSION_KEY, JSON.stringify(session));
    return;
  }

  window.sessionStorage.setItem(EPHEMERAL_SESSION_KEY, JSON.stringify(session));
}

export function getAdminAuthorizationHeader() {
  const session = readAdminSession();

  if (!session) {
    return null;
  }

  return `${session.tokenType} ${session.accessToken}`;
}
