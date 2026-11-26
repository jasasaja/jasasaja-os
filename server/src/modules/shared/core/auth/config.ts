export type AuthConfig = {
  googleClientId: string;
  googleClientSecret: string;
  googleCallbackUrl: string;
  ownerEmails: string[];
  appBaseUrl: string;
  sessionCookieName: string;
  sessionTtlHours: number;
  cookieSecure: boolean;
  authStateSecret: string;
};

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function parseBool(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  if (["1", "true", "yes", "on"].includes(value.toLowerCase())) return true;
  if (["0", "false", "no", "off"].includes(value.toLowerCase())) return false;
  return undefined;
}

export function getAuthConfig(): AuthConfig {
  const appBaseUrl = readEnv("APP_BASE_URL") ?? "http://localhost:3000";
  const secureOverride = parseBool(readEnv("SESSION_COOKIE_SECURE"));
  const cookieSecure = secureOverride ?? appBaseUrl.startsWith("https://");
  const ownerEmails = (readEnv("OWNER_EMAILS") ?? "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  const sessionTtlHoursRaw = Number(readEnv("SESSION_TTL_HOURS") ?? "168");
  const sessionTtlHours = Number.isFinite(sessionTtlHoursRaw) && sessionTtlHoursRaw > 0 ? sessionTtlHoursRaw : 168;

  return {
    googleClientId: readEnv("GOOGLE_CLIENT_ID") ?? "",
    googleClientSecret: readEnv("GOOGLE_CLIENT_SECRET") ?? "",
    googleCallbackUrl: readEnv("GOOGLE_CALLBACK_URL") ?? "http://localhost:3001/api/auth/google/callback",
    ownerEmails,
    appBaseUrl: appBaseUrl.replace(/\/$/, ""),
    sessionCookieName: readEnv("SESSION_COOKIE_NAME") ?? "jasasaja_session",
    sessionTtlHours,
    cookieSecure,
    authStateSecret: readEnv("AUTH_STATE_SECRET") ?? "",
  };
}

export function isGoogleOAuthConfigured(config: AuthConfig = getAuthConfig()): boolean {
  return Boolean(
    config.googleClientId &&
      config.googleClientSecret &&
      config.googleCallbackUrl &&
      config.ownerEmails.length > 0 &&
      config.authStateSecret,
  );
}

export function getAllowedOrigins(config: AuthConfig = getAuthConfig()): string[] {
  const origins = new Set<string>();
  try {
    origins.add(new URL(config.appBaseUrl).origin);
  } catch {
    // ignore invalid APP_BASE_URL, guard will reject
  }
  const extra = readEnv("ALLOWED_ORIGINS");
  if (extra) {
    for (const item of extra.split(",")) {
      const v = item.trim();
      if (!v) continue;
      try {
        origins.add(new URL(v).origin);
      } catch {
        // ignore invalid origin entry
      }
    }
  }
  return Array.from(origins);
}
