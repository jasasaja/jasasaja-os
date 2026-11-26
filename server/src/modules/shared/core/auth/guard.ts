import type { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../errors.ts";
import { getAllowedOrigins, getAuthConfig } from "./config.ts";
import { parseCookies } from "./cookies.ts";
import { findActiveSessionByToken, type SessionRecord } from "./sessions.ts";

declare module "fastify" {
  interface FastifyRequest {
    authSession?: SessionRecord;
  }
}

const PUBLIC_PATHS = new Set(["/api/health"]);
const PUBLIC_AUTH_FLOW_PATHS = new Set(["/api/auth/google/start", "/api/auth/google/callback"]);

function getPathname(request: FastifyRequest): string {
  const url = request.raw.url ?? "/";
  const idx = url.indexOf("?");
  return idx >= 0 ? url.slice(0, idx) : url;
}

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (PUBLIC_AUTH_FLOW_PATHS.has(pathname)) return true;
  return false;
}

function isMutatingMethod(method: string): boolean {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
}

function getRequestOrigin(request: FastifyRequest): string | undefined {
  const origin = request.headers.origin;
  if (typeof origin === "string" && origin.trim()) {
    try {
      return new URL(origin).origin;
    } catch {
      return undefined;
    }
  }
  const referer = request.headers.referer;
  if (typeof referer === "string" && referer.trim()) {
    try {
      return new URL(referer).origin;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function assertAllowedOrigin(request: FastifyRequest): void {
  const allowed = getAllowedOrigins();
  if (allowed.length === 0) {
    throw new AppError(503, "SERVICE_UNAVAILABLE", "Konfigurasi origin aplikasi belum valid.");
  }
  const origin = getRequestOrigin(request);
  if (!origin || !allowed.includes(origin)) {
    throw new AppError(403, "FORBIDDEN", "Origin request tidak diizinkan.");
  }
}

function assertJsonContentType(request: FastifyRequest): void {
  const contentType = request.headers["content-type"];
  const value = Array.isArray(contentType) ? contentType[0] : contentType;
  if (typeof value !== "string" || !value.toLowerCase().includes("application/json")) {
    throw new AppError(400, "VALIDATION_ERROR", "Content-Type harus application/json.");
  }
}

function getSessionToken(request: FastifyRequest): string | undefined {
  const config = getAuthConfig();
  const cookies = parseCookies(request.headers.cookie);
  const token = cookies[config.sessionCookieName];
  return token?.trim() ? token : undefined;
}

function assertCsrf(request: FastifyRequest, session: SessionRecord): void {
  const header = request.headers["x-csrf-token"];
  const value = Array.isArray(header) ? header[0] : header;
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(403, "FORBIDDEN", "CSRF token tidak valid.");
  }
  if (value !== session.csrfToken) {
    throw new AppError(403, "FORBIDDEN", "CSRF token tidak valid.");
  }
}

export async function authGuard(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const pathname = getPathname(request);
  if (!pathname.startsWith("/api/")) return;

  if (request.method.toUpperCase() === "OPTIONS") {
    return;
  }

  if (isPublicPath(pathname)) {
    return;
  }

  const sessionToken = getSessionToken(request);
  if (!sessionToken) {
    throw new AppError(401, "UNAUTHENTICATED", "Sesi tidak valid. Silakan masuk kembali.");
  }

  const session = await findActiveSessionByToken(sessionToken);
  if (!session) {
    throw new AppError(401, "UNAUTHENTICATED", "Sesi tidak valid. Silakan masuk kembali.");
  }

  request.authSession = session;

  if (isMutatingMethod(request.method)) {
    assertAllowedOrigin(request);
    assertJsonContentType(request);
    assertCsrf(request, session);
  }
}
