import type { FastifyInstance } from "fastify";
import { AppError } from "../errors.ts";
import { getAuthConfig, isGoogleOAuthConfigured, getAllowedOrigins } from "./config.ts";
import { createOAuthStateCookieValue, verifyOAuthStateCookieValue } from "./oauth-state.ts";
import { parseCookies, serializeCookie, serializeExpiredCookie } from "./cookies.ts";
import { createSession, revokeSessionByToken } from "./sessions.ts";
import { generateOpaqueToken } from "./crypto.ts";

const OAUTH_STATE_MAX_AGE_MS = 10 * 60 * 1000;

function getOAuthStateCookieName(): string {
  const { sessionCookieName } = getAuthConfig();
  return `${sessionCookieName}_oauth_state`;
}

function getCookieBaseOptions() {
  const config = getAuthConfig();
  return {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: "Lax" as const,
    path: "/",
  };
}

function buildGoogleAuthUrl(state: string, nonce: string): string {
  const config = getAuthConfig();
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", config.googleClientId);
  url.searchParams.set("redirect_uri", config.googleCallbackUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("access_type", "online");
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

async function exchangeCodeForTokens(code: string): Promise<{ accessToken: string }> {
  const config = getAuthConfig();
  const body = new URLSearchParams({
    code,
    client_id: config.googleClientId,
    client_secret: config.googleClientSecret,
    redirect_uri: config.googleCallbackUrl,
    grant_type: "authorization_code",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new AppError(401, "UNAUTHENTICATED", "Autentikasi Google gagal. Silakan coba lagi.");
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new AppError(401, "UNAUTHENTICATED", "Autentikasi Google gagal. Silakan coba lagi.");
  }
  return { accessToken: data.access_token };
}

async function fetchGoogleUserInfo(accessToken: string): Promise<{ sub: string; email: string; emailVerified: boolean; name?: string }> {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new AppError(401, "UNAUTHENTICATED", "Gagal memverifikasi identitas Google.");
  }

  const data = (await response.json()) as { sub?: string; email?: string; email_verified?: boolean; name?: string };
  if (!data.sub || !data.email || data.email_verified !== true) {
    throw new AppError(403, "FORBIDDEN", "Identitas Google tidak valid atau belum terverifikasi.");
  }

  return {
    sub: data.sub,
    email: data.email.toLowerCase(),
    emailVerified: true,
    name: data.name,
  };
}

function assertOwnerAllowed(email: string): void {
  const config = getAuthConfig();
  if (!config.ownerEmails.includes(email.toLowerCase())) {
    throw new AppError(403, "FORBIDDEN", "Akun ini tidak memiliki akses.");
  }
}

function safeRedirectTarget(target: string | undefined): string {
  const config = getAuthConfig();
  const fallback = `${config.appBaseUrl}/dashboard`;
  if (!target) return fallback;
  try {
    const allowed = getAllowedOrigins(config);
    const url = new URL(target, config.appBaseUrl);
    if (!allowed.includes(url.origin)) return fallback;
    if (!url.pathname.startsWith("/")) return fallback;
    return url.toString();
  } catch {
    return fallback;
  }
}

export function registerAuthRoutes(app: FastifyInstance): void {
  app.get("/api/auth/google/start", async (_request, reply) => {
    const config = getAuthConfig();
    if (!isGoogleOAuthConfigured(config)) {
      throw new AppError(503, "SERVICE_UNAVAILABLE", "Google Login belum dikonfigurasi.");
    }

    const state = generateOpaqueToken(24);
    const nonce = generateOpaqueToken(24);
    const stateCookieValue = createOAuthStateCookieValue({ state, nonce, createdAt: Date.now() }, config.authStateSecret);
    const oauthCookieName = getOAuthStateCookieName();

    reply.header(
      "Set-Cookie",
      serializeCookie(oauthCookieName, stateCookieValue, { ...getCookieBaseOptions(), maxAgeSeconds: 600 }),
    );

    const authUrl = buildGoogleAuthUrl(state, nonce);
    return reply.status(302).redirect(authUrl);
  });

  app.get("/api/auth/google/callback", async (request, reply) => {
    const config = getAuthConfig();
    if (!isGoogleOAuthConfigured(config)) {
      throw new AppError(503, "SERVICE_UNAVAILABLE", "Google Login belum dikonfigurasi.");
    }

    const query = request.query as { code?: string; state?: string; error?: string };
    if (query.error) {
      throw new AppError(401, "UNAUTHENTICATED", "Autentikasi Google dibatalkan atau gagal.");
    }
    if (!query.code || !query.state) {
      throw new AppError(400, "VALIDATION_ERROR", "Parameter callback Google tidak lengkap.");
    }

    const cookies = parseCookies(request.headers.cookie);
    const oauthCookieName = getOAuthStateCookieName();
    const stateCookieValue = cookies[oauthCookieName];
    if (!stateCookieValue) {
      throw new AppError(401, "UNAUTHENTICATED", "State autentikasi tidak valid atau kedaluwarsa.");
    }

    const parsed = verifyOAuthStateCookieValue(stateCookieValue, config.authStateSecret, OAUTH_STATE_MAX_AGE_MS);
    if (!parsed || parsed.state !== query.state) {
      throw new AppError(401, "UNAUTHENTICATED", "State autentikasi tidak valid atau kedaluwarsa.");
    }

    const { accessToken } = await exchangeCodeForTokens(query.code);
    const userInfo = await fetchGoogleUserInfo(accessToken);
    assertOwnerAllowed(userInfo.email);

    const session = await createSession({ ownerSubject: userInfo.sub, ownerEmail: userInfo.email });
    const clearStateCookie = serializeExpiredCookie(oauthCookieName, getCookieBaseOptions());
    const sessionCookie = serializeCookie(config.sessionCookieName, session.sessionToken, {
      ...getCookieBaseOptions(),
      maxAgeSeconds: config.sessionTtlHours * 60 * 60,
      expires: session.expiresAt,
    });

    reply.header("Set-Cookie", [clearStateCookie, sessionCookie]);
    return reply.status(302).redirect(safeRedirectTarget(`${config.appBaseUrl}/dashboard`));
  });

  app.get("/api/auth/me", async (request) => {
    const session = request.authSession;
    if (!session) {
      throw new AppError(401, "UNAUTHENTICATED", "Sesi tidak valid. Silakan masuk kembali.");
    }
    return {
      data: {
        owner: {
          id: session.ownerSubject,
          email: session.ownerEmail,
          displayName: session.ownerEmail,
        },
        csrfToken: session.csrfToken,
      },
    };
  });

  app.post("/api/auth/logout", async (request, reply) => {
    const config = getAuthConfig();
    const cookies = parseCookies(request.headers.cookie);
    const token = cookies[config.sessionCookieName];
    if (token) {
      await revokeSessionByToken(token);
    }

    reply.header("Set-Cookie", serializeExpiredCookie(config.sessionCookieName, getCookieBaseOptions()));
    return { data: { ok: true } };
  });
}
