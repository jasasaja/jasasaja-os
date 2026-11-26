import { createHmac, timingSafeEqual } from "node:crypto";

type OAuthStatePayload = {
  state: string;
  nonce: string;
  createdAt: number;
};

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function createOAuthStateCookieValue(payload: OAuthStatePayload, secret: string): string {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = sign(encoded, secret);
  return `${encoded}.${signature}`;
}

export function verifyOAuthStateCookieValue(value: string, secret: string, maxAgeMs: number): OAuthStatePayload | null {
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature) return null;
  const expected = sign(encoded, secret);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as OAuthStatePayload;
    if (!parsed || typeof parsed.state !== "string" || typeof parsed.nonce !== "string" || typeof parsed.createdAt !== "number") {
      return null;
    }
    if (Date.now() - parsed.createdAt > maxAgeMs) return null;
    return parsed;
  } catch {
    return null;
  }
}
